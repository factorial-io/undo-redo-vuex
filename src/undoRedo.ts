/* eslint-disable no-param-reassign, no-shadow */
import {
  EMPTY_STATE,
  UPDATE_CAN_UNDO_REDO,
  REDO,
  UNDO,
  CLEAR,
  RESET,
  UPDATE_UNDO_REDO_CONFIG
} from "./constants";
import { getConfig, setConfig, updateCanUndoRedo } from "./utils-undo-redo";
import execRedo from "./redo";
import execUndo from "./undo";
import execClear from "./clear";
import execReset from "./reset";

// Logic based on: https://github.com/anthonygore/vuex-undo-redo

const noop = () => {};
export const undo = noop;
export const redo = noop;
export const clear = noop;
export const reset = noop;
export const getUndoRedoConfig = noop;

export const scaffoldState = (state: any, exposeUndoRedoConfig = false) => ({
  ...state,
  canUndo: false,
  canRedo: false,
  ...(exposeUndoRedoConfig
    ? {
        undoRedoConfig: {}
      }
    : {})
});

export const scaffoldActions = (
  actions: any,
  exposeUndoRedoConfig = false
) => ({
  ...actions,
  undo,
  redo,
  clear,
  reset,
  ...(exposeUndoRedoConfig
    ? {
        getUndoRedoConfig
      }
    : {})
});

export const scaffoldMutations = (
  mutations: any,
  exposeUndoRedoConfig = false
) => ({
  ...mutations,
  [UPDATE_CAN_UNDO_REDO]: (state: any, payload: any) => {
    if (payload.canUndo !== undefined) state.canUndo = payload.canUndo;
    if (payload.canRedo !== undefined) state.canRedo = payload.canRedo;
  },
  [UPDATE_UNDO_REDO_CONFIG]: exposeUndoRedoConfig
    ? (state: any, { done, undone }: { done: any[]; undone: any[] }) => {
        state.undoRedoConfig.done = [...done];
        state.undoRedoConfig.undone = [...undone];
      }
    : noop
});

export const scaffoldStore = (store: any, exposeUndoRedoConfig = false) => ({
  ...store,
  state: scaffoldState(store.state || {}, exposeUndoRedoConfig),
  actions: scaffoldActions(store.actions || {}, exposeUndoRedoConfig),
  mutations: scaffoldMutations(store.mutations || {}, exposeUndoRedoConfig)
});

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
  paths.map(({ namespace, ignoreMutations, exposeUndoRedoConfig }) =>
    createPathConfig({
      namespace: `${namespace}/`,
      ...(ignoreMutations
        ? mapIgnoreMutations({ namespace, ignoreMutations })
        : {}),
      exposeUndoRedoConfig
    })
  );

const canRedo = (paths: UndoRedoOptions[]) => (namespace: string) => {
  const config = getConfig(paths)(namespace);
  if (Object.keys(config).length) {
    return config.undone.length > 0;
  }
  return false;
};

const canUndo = (paths: UndoRedoOptions[]) => (namespace: string) => {
  const config = getConfig(paths)(namespace);
  if (config) {
    return config.done.length > 0;
  }
  return false;
};

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
  const paths = options.paths
    ? mapPaths(options.paths)
    : [
        createPathConfig({
          ignoreMutations: [
            ...(options.ignoreMutations || []),
            UPDATE_CAN_UNDO_REDO,
            UPDATE_UNDO_REDO_CONFIG
          ],
          exposeUndoRedoConfig: options.exposeUndoRedoConfig
        })
      ];

  store.subscribe((mutation: Mutation) => {
    const isStoreNamespaced = mutation.type.split("/").length > 1;
    const namespace = isStoreNamespaced
      ? `${mutation.type.split("/")[0]}/`
      : "";
    const config = getConfig(paths)(namespace);

    if (Object.keys(config).length) {
      const {
        ignoreMutations,
        newMutation,
        done,
        exposeUndoRedoConfig
      } = config;

      if (
        mutation.type !== `${namespace}${EMPTY_STATE}` &&
        mutation.type !== `${namespace}${UPDATE_CAN_UNDO_REDO}` &&
        mutation.type !== `${namespace}${UPDATE_UNDO_REDO_CONFIG}` &&
        ignoreMutations.indexOf(mutation.type) === -1 &&
        mutation.type.includes(namespace) &&
        newMutation
      ) {
        done.push(mutation);

        setConfig(paths)(namespace, {
          ...config,
          done
        }, store);

        updateCanUndoRedo({ paths, store })(namespace);
      }
    }
  });

  // NB: Watch all actions to intercept the undo/redo NOOP actions
  store.subscribeAction(async (action: Action) => {
    const isStoreNamespaced = action.type.split("/").length > 1;
    const namespace = isStoreNamespaced ? `${action.type.split("/")[0]}/` : "";

    switch (action.type) {
      case `${namespace}${REDO}`:
        if (canRedo(paths)(namespace))
          await execRedo({ paths, store })(namespace);
        break;
      case `${namespace}${UNDO}`:
        if (canUndo(paths)(namespace))
          await execUndo({ paths, store })(namespace);
        break;
      case `${namespace}${CLEAR}`:
        await execClear({ paths, store })(namespace);
        break;
      case `${namespace}${RESET}`:
        await execReset({ paths, store })(namespace);
        break;
      default:
        break;
    }
  });
};
