import {
  getConfig,
  pipeActions,
  setConfig,
  updateCanUndoRedo
} from "./utils-undo-redo";

/**
 * The Redo function - commits the latest undone mutation to the store,
 * and pushes it to the done stack
 *
 * @module store/plugins/undoRedo:redo
 * @function
 */
export default ({
  paths,
  store
}: {
  paths: UndoRedoOptions[];
  store: any;
}) => async (namespace: string) => {
  const config = getConfig(paths)(namespace);
  if (Object.keys(config).length) {
    /**
     * @var {Array} undone - The updated undone stack
     * @var {Array} commits - The list of mutations to be redone
     * NB: The reduceRight operation is used to identify the mutation(s) from the
     * top of the undone stack to be redone
     */
    const { undone, commits } = config.undone.reduceRight(
      (
        {
          commits,
          undone,
          proceed
        }: {
          commits: Array<Mutation> | [];
          undone: Array<Mutation> | [];
          proceed: boolean;
        },
        m: Mutation
      ) => {
        if (!commits.length) {
          // The "topmost" mutation
          commits = [m];
          // Do not find more mutations if the mutations does not belong to a group
          proceed = !!m.payload.actionGroup;
        } else if (!proceed) {
          // The mutation(s) to redo have been identified
          undone = [m, ...undone];
        } else {
          // Find mutations belonging to the same actionGroup
          const lastCommit = commits[commits.length - 1];
          const { actionGroup } = lastCommit.payload;
          // Stop finding more mutations if the current mutation belongs to
          // another actionGroup, or does not have an actionGroup
          proceed =
            m.payload.actionGroup && m.payload.actionGroup === actionGroup;
          commits = [...(proceed ? [m] : []), ...commits];
          undone = [...(proceed ? [] : [m]), ...undone];
        }

        return { commits, undone, proceed };
      },
      {
        commits: [],
        undone: [],
        proceed: true
      }
    );

    config.newMutation = false;
    // NB: The array of redoCallbacks and respective action payloads
    const redoCallbacks = commits
      .filter((mutation: Mutation) => mutation.type && mutation.payload)
      .map(async ({ type, payload }: Mutation) => {
        // NB: Commit each mutation in the redo stack
        store.commit(
          type,
          Array.isArray(payload) ? [...payload] : payload.constructor(payload)
        );

        // Check if there is an redo callback action
        const { redoCallback } = payload;
        // NB: The object containing the redoCallback action and payload
        return {
          action: redoCallback ? `${namespace}${redoCallback}` : "",
          payload
        };
      });
    await pipeActions(store)(await Promise.all(redoCallbacks));
    config.done = [...config.done, ...commits];
    config.newMutation = true;
    setConfig(paths)(
      namespace,
      {
        ...config,
        undone
      },
      store
    );

    updateCanUndoRedo({ paths, store })(namespace);
  }
};
