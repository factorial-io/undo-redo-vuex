import { EMPTY_STATE } from "./constants";
import {
  getConfig,
  pipeActions,
  setConfig,
  updateCanUndoRedo
} from "./utils-undo-redo";

/**
 * The Undo function - pushes the latest done mutation to the top of the undone
 * stack by popping the done stack and 'replays' all mutations in the done stack
 *
 * @module store/plugins/undoRedo:undo
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
     * @var {Array} done - The updated done stack
     * @var {Array} commits - The list of mutations which are undone
     * NB: The reduceRight operation is used to identify the mutation(s) from the
     * top of the done stack to be undone
     */
    const { done, commits } = config.done.reduceRight(
      (
        {
          commits,
          done,
          proceed
        }: {
          commits: Array<Mutation> | [];
          done: Array<Mutation> | [];
          proceed: boolean;
        },
        m: Mutation
      ) => {
        if (!commits.length) {
          // The "topmost" mutation from the done stack
          commits = [m];
          // Do not find more mutations if the mutations does not belong to a group
          proceed = !!m.payload.actionGroup;
        } else if (!proceed) {
          // Unshift the mutation to the done stack
          done = [m, ...done];
        } else {
          const lastUndone = commits[commits.length - 1];
          const { actionGroup } = lastUndone.payload;
          // Unshift to commits if mutation belongs to the same actionGroup,
          // otherwise unshift to the done stack
          proceed =
            m.payload.actionGroup && m.payload.actionGroup === actionGroup;
          commits = [...(proceed ? [m] : []), ...commits];
          done = [...(proceed ? [] : [m]), ...done];
        }

        return { done, commits, proceed };
      },
      {
        done: [],
        commits: [],
        proceed: true
      }
    );

    // Check if there are any undo callback actions
    const undoCallbacks = commits.map(({ payload }: { payload: any }) => ({
      action: payload.undoCallback ? `${namespace}${payload.undoCallback}` : "",
      payload
    }));
    await pipeActions(store)(undoCallbacks);

    const undone = [...config.undone, ...commits];
    config.newMutation = false;
    store.commit(`${namespace}${EMPTY_STATE}`);
    const redoCallbacks = done
      .filter((mutation: Mutation) => mutation.type && mutation.payload)
      .map(async (mutation: Mutation) => {
        store.commit(
          mutation.type,
          Array.isArray(mutation.payload)
            ? [...mutation.payload]
            : mutation.payload.constructor(mutation.payload)
        );

        // Check if there is an undo callback action
        const { redoCallback } = mutation.payload;
        return {
          action: redoCallback ? `${namespace}${redoCallback}` : "",
          payload: mutation.payload
        };
      });
    await pipeActions(store)(await Promise.all(redoCallbacks));
    config.newMutation = true;
    setConfig(paths)(
      namespace,
      {
        ...config,
        done,
        undone
      },
      store
    );

    updateCanUndoRedo({ paths, store })(namespace);
  }
};
