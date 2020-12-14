/* eslint-disable no-param-reassign, no-shadow */
import { UPDATE_CAN_UNDO_REDO, UPDATE_UNDO_REDO_CONFIG } from "./constants";
import { subscribeToMutations, subscribeToActions } from "./subscriptions";

// Logic based on: https://github.com/anthonygore/vuex-undo-redo

export {
  scaffoldState,
  scaffoldMutations,
  scaffoldActions,
  scaffoldStore
} from "./scaffolders";

const createPathConfig = ({
  namespace = "",
  ignoreMutations = [],
  exposeUndoRedoConfig = false
}: UndoRedoOptions): UndoRedoOptions => ({
  namespace,
  ignoreMutations,
  done: [],
  undone: [],
  newMutation: true,
  exposeUndoRedoConfig
});

const mapIgnoreMutations = ({
  namespace,
  ignoreMutations
}: UndoRedoOptions) => ({
  ignoreMutations: (ignoreMutations || [])
    .map(mutation => `${namespace}/${mutation}`)
    .concat([
      `${namespace}/${UPDATE_CAN_UNDO_REDO}`,
      `${namespace}/${UPDATE_UNDO_REDO_CONFIG}`
    ])
});

const mapPaths = (paths: UndoRedoOptions[]) =>
  paths.map(({ namespace, ignoreMutations, exposeUndoRedoConfig }) => {
    let pathConfig = {
      namespace: `${namespace}/`,
      exposeUndoRedoConfig
    };

    if (ignoreMutations) {
      pathConfig = {
        ...pathConfig,
        ...mapIgnoreMutations({ namespace, ignoreMutations })
      };
    }

    return createPathConfig(pathConfig);
  });

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
export default (options: UndoRedoOptions = {}) => (store: any) => {
  const pathConfig = {
    ignoreMutations: [UPDATE_CAN_UNDO_REDO, UPDATE_UNDO_REDO_CONFIG],
    exposeUndoRedoConfig: options.exposeUndoRedoConfig
  };

  if (options.ignoreMutations) {
    pathConfig.ignoreMutations.concat(options.ignoreMutations);
  }

  const paths = options.paths
    ? mapPaths(options.paths)
    : [createPathConfig(pathConfig)];

  store.subscribe(
    subscribeToMutations({
      paths,
      store
    })
  );

  // NB: Watch all actions to intercept the undo/redo NOOP actions
  store.subscribeAction(
    subscribeToActions({
      paths,
      store
    })
  );
};
