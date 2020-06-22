/* eslint-disable no-param-reassign, no-shadow */
import {
  EMPTY_STATE,
  UPDATE_CAN_UNDO_REDO,
  REDO,
  UNDO,
  CLEAR,
  RESET
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

export const scaffoldState = (state: any) => ({
  ...state,
  canUndo: false,
  canRedo: false
});

export const scaffoldActions = (actions: any) => ({
  ...actions,
  undo,
  redo,
  clear,
  reset
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

const createPathConfig = ({
  namespace = "",
  ignoreMutations = []
}: UndoRedoOptions): UndoRedoOptions => ({
  namespace,
  ignoreMutations,
  done: [],
  undone: [],
  newMutation: true
});

const mapIgnoreMutations = ({
  namespace,
  ignoreMutations
}: UndoRedoOptions) => ({
  ignoreMutations: (ignoreMutations || [])
    .map(mutation => `${namespace}/${mutation}`)
    .concat(`${namespace}/${UPDATE_CAN_UNDO_REDO}`)
});

const mapPaths = (paths: UndoRedoOptions[]) =>
  paths.map(({ namespace, ignoreMutations }) =>
    createPathConfig({
      namespace: `${namespace}/`,
      ...(ignoreMutations
        ? mapIgnoreMutations({ namespace, ignoreMutations })
        : {})
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
            UPDATE_CAN_UNDO_REDO
          ]
        })
      ];

  store.subscribe((mutation: Mutation) => {
    const isStoreNamespaced = mutation.type.split("/").length > 1;
    const namespace = isStoreNamespaced
      ? `${mutation.type.split("/")[0]}/`
      : "";
    const config = getConfig(paths)(namespace);

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
        setConfig(paths)(namespace, {
          ...config,
          done
        });
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
