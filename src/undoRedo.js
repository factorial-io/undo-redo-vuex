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

  // const namespace = options.namespace ? `${options.namespace}/` : '';
  const paths = options.paths
    ? options.paths.map(({ namespace, ignoreMutations }) => ({
        ...pathConfig,
        namespace: `${namespace}/`,
        ignoreMutations: ignoreMutations.map(
          mutation => `${namespace}/${mutation}`,
        ),
      }))
    : [{ ...pathConfig }];

  const getConfig = namespace =>
    paths.find(path => path.namespace === namespace) || {};

  /**
   * The Redo function - commits the latest undone mutation to the store,
   * and pushes it to the done stack
   *
   * @module store/plugins/undoRedo:redo
   * @function
   */
  const redo = namespace => {
    const config = getConfig(namespace);
    if (Object.keys(config).length) {
      const { undone, done } = config;
      const commit = undone.pop();
      config.newMutation = false;
      store.commit(`${commit.type}`, { ...commit.payload });
      done.push(commit);
      config.newMutation = true;
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
  const undo = namespace => {
    const config = getConfig(namespace);

    if (Object.keys(config).length) {
      const { undone, done } = config;
      const lastDone = done.pop();

      // Check if there is an undo callback action
      const { payload } = lastDone;
      const { undoCallback, redoCallback } = payload;
      if (undoCallback) store.dispatch(`${namespace}${undoCallback}`, payload);
      if (redoCallback) store.dispatch(`${namespace}${redoCallback}`, payload);

      undone.push(lastDone);
      config.newMutation = false;
      store.commit(`${namespace}${EMPTY_STATE}`);
      done.forEach(mutation => {
        store.commit(`${mutation.type}`, { ...mutation.payload });
        done.unshift();
      });
      config.newMutation = true;
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

  store.subscribeAction(action => {
    const namespace = `${action.type.split('/')[0]}/`;

    switch (action.type) {
      case `${namespace}/${REDO}`:
        if (canRedo(namespace)) redo(namespace);
        break;
      case `${namespace}${UNDO}`:
        if (canUndo(namespace)) undo(namespace);
        break;
      default:
        break;
    }
  });
};
