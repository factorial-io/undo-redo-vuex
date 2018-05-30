// Logic based on: https://github.com/anthonygore/vuex-undo-redo

const EMPTY_STATE = 'emptyState';
const REDO = 'redo';
const UNDO = 'undo';

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
export default (options = {}) => store => {
  const pathConfig = {
    namespace: '',
    ignoreMutations: [],
    done: [],
    undone: [],
    newMutation: true,
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
  const pipeActions = actions =>
    actions
      .filter(({ action }) => !!action)
      .reduce(
        (promise, { action, payload }) =>
          promise.then(() => store.dispatch(action, payload)),
        Promise.resolve(),
      );

  const paths = options.paths
    ? options.paths.map(({ namespace, ignoreMutations }) => ({
        ...pathConfig,
        namespace: `${namespace}/`,
        ignoreMutations: ignoreMutations.map(
          mutation => `${namespace}/${mutation}`,
        ),
      }))
    : [{ ...pathConfig }];

  /**
   * Piping async action calls secquentially using Array.prototype.reduce
   * to chain and initial, empty promise
   *
   * @module store/plugins/undoRedo:getConfig
   * @function
   * @param {String} namespace - The name of the store module
   * @returns {Object} config - The object containing the undo/redo stacks of the store module
   */
  const getConfig = namespace =>
    paths.find(path => path.namespace === namespace) || {};

  /**
   * Piping async action calls secquentially using Array.prototype.reduce
   * to chain and initial, empty promise
   *
   * @module store/plugins/undoRedo:setConfig
   * @function
   * @param {String} namespace - The name of the store module
   * @param {String} config - The object containing the updated undo/redo stacks of the store module
   */
  const setConfig = (namespace, config) => {
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
  const redo = async namespace => {
    const config = getConfig(namespace);
    if (Object.keys(config).length) {
      let { undone } = config;

      const commit = undone.pop();
      // NB: Arbitrary name to identify mutations which have been grouped in a single action
      const { actionGroup } = commit.payload;
      const commits = [
        commit,
        ...(actionGroup
          ? undone.filter(
              m =>
                // NB: If the curren mutation is a grouped mutation, only commit
                // it belongs to another group
                (m.payload.actionGroup &&
                  m.payload.actionGroup !== actionGroup) ||
                // NB: Commit the mutation if it is not a grouped mutation
                !m.payload.actionGroup,
            )
          : undone),
      ];

      // NB: The new redo stack to be updated in the config object
      undone = actionGroup
        ? undone.filter(
            m =>
              !m.payload.actionGroup ||
              (m.payload.actionGroup && m.payload.actionGroup !== actionGroup),
          )
        : [...undone];

      config.newMutation = false;
      // NB: The array of redoCallbacks and respective action payloads
      const redoCallbacks = commits.map(async ({ type, payload }) => {
        // NB: Commit each mutation in the redo stack
        store.commit(
          type,
          payload.constuctor === Array
            ? [...payload]
            : payload.constructor(payload),
        );

        // Check if there is an redo callback action
        const { redoCallback } = payload;
        // NB: The object containing the redoCallback action and payload
        return {
          action: redoCallback ? `${namespace}${redoCallback}` : '',
          payload,
        };
      });
      await pipeActions(await Promise.all(redoCallbacks));
      config.done = [...config.done, ...commits];
      config.newMutation = true;
      setConfig(namespace, {
        ...config,
        undone,
      });
    }
  };
  const canRedo = namespace => {
    const config = getConfig(namespace);
    if (Object.keys(config).length) {
      return config.undone.length > 0;
    }
    return false;
  };

  /**
   * The Undo function - pushes the latest done mutation to the top of the undone
   * stack by popping the done stack and 'replays' all mutations in the done stack
   *
   * @module store/plugins/undoRedo:undo
   * @function
   */
  const undo = async namespace => {
    const config = getConfig(namespace);

    if (Object.keys(config).length) {
      let { undone, done } = config;

      const commit = done.pop();

      const { actionGroup } = commit.payload;
      const commits = [
        commit,
        ...(actionGroup
          ? done.filter(
              m =>
                !m.payload.actionGroup ||
                (m.payload.actionGroup &&
                  m.payload.actionGroup !== actionGroup),
            )
          : []),
      ];

      // Check if there are any undo callback actions
      const undoCallbacks = commits.map(({ payload }) => ({
        action: payload.undoCallback
          ? `${namespace}${payload.undoCallback}`
          : '',
        payload,
      }));
      await pipeActions(undoCallbacks);

      done = [
        ...(actionGroup
          ? done.filter(
              m =>
                (m.payload.actionGroup &&
                  m.payload.actionGroup !== actionGroup) ||
                !m.payload.actionGroup,
            )
          : done),
      ];

      undone = [...undone, ...commits];
      config.newMutation = false;
      store.commit(`${namespace}${EMPTY_STATE}`);
      const redoCallbacks = done.map(async mutation => {
        store.commit(
          mutation.type,
          mutation.payload.constuctor === Array
            ? [...mutation.payload]
            : mutation.payload.constructor(mutation.payload),
        );

        // Check if there is an undo callback action
        const { redoCallback } = mutation.payload;
        return {
          action: redoCallback ? `${namespace}${redoCallback}` : '',
          payload: mutation.payload,
        };
      });
      await pipeActions(await Promise.all(redoCallbacks));
      config.newMutation = true;
      setConfig(namespace, {
        ...config,
        done,
        undone,
      });
    }
  };
  const canUndo = () => namespace => {
    const config = getConfig(namespace);
    if (config) {
      return config.done.length > 0;
    }
    return false;
  };

  store.subscribe(mutation => {
    const namespace = `${mutation.type.split('/')[0]}/`;
    const config = getConfig(namespace);

    if (Object.keys(config).length) {
      const { ignoreMutations, newMutation, done } = config;

      if (
        mutation.type !== `${namespace}${EMPTY_STATE}` &&
        ignoreMutations.indexOf(mutation.type) === -1 &&
        mutation.type.includes(namespace) &&
        newMutation
      ) {
        done.push(mutation);
      }

      if (newMutation && mutation.type.includes(namespace)) {
        config.undone = [];
      }
    }
  });

  // NB: Watch all actions to intercept the undo/redo NOOP actions
  store.subscribeAction(async action => {
    const namespace = `${action.type.split('/')[0]}/`;

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
