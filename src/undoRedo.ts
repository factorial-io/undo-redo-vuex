/* eslint-disable no-param-reassign, no-shadow */

// Logic based on: https://github.com/anthonygore/vuex-undo-redo

const EMPTY_STATE = "emptyState";
const UPDATE_CAN_UNDO_REDO = "updateCanUndoRedo";
const REDO = "redo";
const UNDO = "undo";

const noop = () => {};
export const undo = noop;
export const redo = noop;

export const scaffoldState = (state: any) => ({
  ...state,
  canUndo: false,
  canRedo: false
});

export const scaffoldActions = (actions: any) => ({
  ...actions,
  undo,
  redo
});

export const scaffoldMutations = (mutations: any) => ({
  ...mutations,
  updateCanUndoRedo: (state: any, payload: any) => {
    if (payload.canUndo !== undefined) state.canUndo = payload.canUndo;
    if (payload.canRedo !== undefined) state.canRedo = payload.canRedo;
  }
});

export const scaffoldStore = (store: any) => ({
  ...store,
  state: scaffoldState(store.state || {}),
  actions: scaffoldActions(store.actions || {}),
  mutations: scaffoldMutations(store.mutations || {})
});

interface UndoRedoOptions {
  namespace?: string;
  ignoreMutations?: Array<string>;
  paths?: Array<UndoRedoOptions>;
  newMutation?: boolean;
  done?: Array<Mutation> | [];
  undone?: Array<Mutation> | [];
}

interface Mutation {
  type: string;
  payload: any;
}

interface Action {
  type: string;
  payload: any;
}

/**
 * The Undo-Redo plugin module
 *
 * @module store/plugins/undoRedo
 * @function
 * @param {Object} options
 * @param {String} options.namespace - The named vuex store module
 * @param {Array<String>} options.ignoreMutations - The list of store mutations
 * (belonging to the module) to be ignored
 * @returns {Function} plugin - the plugin function which accepts the store parameter
 */
export default (options: UndoRedoOptions) => (store: any) => {
  const createPathConfig = ({
    namespace = "",
    ignoreMutations = []
  }: UndoRedoOptions) => ({
    namespace,
    ignoreMutations,
    done: [],
    undone: [],
    newMutation: true
  });

  const paths = options.paths
    ? options.paths.map(({ namespace, ignoreMutations }) =>
        createPathConfig({
          namespace: `${namespace}/`,
          ...(ignoreMutations
            ? {
                ignoreMutations: ignoreMutations
                  .map(mutation => `${namespace}/${mutation}`)
                  .concat(`${namespace}/${UPDATE_CAN_UNDO_REDO}`)
              }
            : {})
        })
      )
    : [
        createPathConfig({
          ignoreMutations: [
            ...(options.ignoreMutations || []),
            UPDATE_CAN_UNDO_REDO
          ]
        })
      ];

  /**
   * Piping async action calls secquentially using Array.prototype.reduce
   * to chain and initial, empty promise
   *
   * @module store/plugins/undoRedo:getConfig
   * @function
   * @param {String} namespace - The name of the store module
   * @returns {Object} config - The object containing the undo/redo stacks of the store module
   */
  const getConfig: UndoRedoOptions | any = (namespace: string): object =>
    paths.find(path => path.namespace === namespace) || {};

  const canRedo = (namespace: string) => {
    const config = getConfig(namespace);
    if (Object.keys(config).length) {
      return config.undone.length > 0;
    }
    return false;
  };

  const canUndo = (namespace: string) => {
    const config = getConfig(namespace);
    if (config) {
      return config.done.length > 0;
    }
    return false;
  };

  const updateCanUndoRedo = (namespace: string) => {
    const undoEnabled = canUndo(namespace);
    const redoEnabled = canRedo(namespace);

    store.commit(`${namespace}${UPDATE_CAN_UNDO_REDO}`, {
      canUndo: undoEnabled
    });
    store.commit(`${namespace}${UPDATE_CAN_UNDO_REDO}`, {
      canRedo: redoEnabled
    });
  };

  // Based on https://gist.github.com/anvk/5602ec398e4fdc521e2bf9940fd90f84
  /**
   * Piping async action calls secquentially using Array.prototype.reduce
   * to chain and initial, empty promise
   *
   * @module store/plugins/undoRedo:pipeActions
   * @function
   * @param {Array<Object>} actions - The array of objects containing the each
   * action's name and payload
   */
  const pipeActions = (actions: Array<any>) =>
    actions
      .filter(({ action }) => !!action)
      .reduce(
        (promise, { action, payload }) =>
          promise.then(() => store.dispatch(action, payload)),
        Promise.resolve()
      );

  /**
   * Piping async action calls secquentially using Array.prototype.reduce
   * to chain and initial, empty promise
   *
   * @module store/plugins/undoRedo:setConfig
   * @function
   * @param {String} [namespace] - The name of the store module
   * @param {Object} config - The object containing the updated undo/redo stacks of the store module
   */
  const setConfig = (namespace: string, config: any) => {
    const pathIndex = paths.findIndex(path => path.namespace === namespace);
    paths.splice(pathIndex, 1, config);
  };

  /**
   * The Redo function - commits the latest undone mutation to the store,
   * and pushes it to the done stack
   *
   * @module store/plugins/undoRedo:redo
   * @function
   */
  const redo = async (namespace: string) => {
    const config = getConfig(namespace);
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
      const redoCallbacks = commits.map(async ({ type, payload }: Mutation) => {
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
      await pipeActions(await Promise.all(redoCallbacks));
      config.done = [...config.done, ...commits];
      config.newMutation = true;
      setConfig(namespace, {
        ...config,
        undone
      });

      updateCanUndoRedo(namespace);
    }
  };

  /**
   * The Undo function - pushes the latest done mutation to the top of the undone
   * stack by popping the done stack and 'replays' all mutations in the done stack
   *
   * @module store/plugins/undoRedo:undo
   * @function
   */
  const undo = async (namespace: string) => {
    const config = getConfig(namespace);

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
        action: payload.undoCallback
          ? `${namespace}${payload.undoCallback}`
          : "",
        payload
      }));
      await pipeActions(undoCallbacks);

      const undone = [...config.undone, ...commits];
      config.newMutation = false;
      store.commit(`${namespace}${EMPTY_STATE}`);
      const redoCallbacks = done.map(async (mutation: Mutation) => {
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
      await pipeActions(await Promise.all(redoCallbacks));
      config.newMutation = true;
      setConfig(namespace, {
        ...config,
        done,
        undone
      });

      updateCanUndoRedo(namespace);
    }
  };

  store.subscribe((mutation: Mutation) => {
    const isStoreNamespaced = mutation.type.split("/").length > 1;
    const namespace = isStoreNamespaced
      ? `${mutation.type.split("/")[0]}/`
      : "";
    const config = getConfig(namespace);

    if (Object.keys(config).length) {
      const { ignoreMutations, newMutation, done } = config;

      if (
        mutation.type !== `${namespace}${EMPTY_STATE}` &&
        mutation.type !== `${namespace}${UPDATE_CAN_UNDO_REDO}` &&
        ignoreMutations.indexOf(mutation.type) === -1 &&
        mutation.type.includes(namespace) &&
        newMutation
      ) {
        done.push(mutation);
        setConfig(namespace, {
          ...config,
          done
        });
        updateCanUndoRedo(namespace);
      }
    }
  });

  // NB: Watch all actions to intercept the undo/redo NOOP actions
  store.subscribeAction(async (action: Action) => {
    const isStoreNamespaced = action.type.split("/").length > 1;
    const namespace = isStoreNamespaced ? `${action.type.split("/")[0]}/` : "";

    switch (action.type) {
      case `${namespace}${REDO}`:
        if (canRedo(namespace)) await redo(namespace);
        break;
      case `${namespace}${UNDO}`:
        if (canUndo(namespace)) await undo(namespace);
        break;
      default:
        break;
    }
  });
};
