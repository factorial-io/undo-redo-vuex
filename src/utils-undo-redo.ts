import { UPDATE_CAN_UNDO_REDO, UPDATE_UNDO_REDO_CONFIG } from "./constants";

/**
 * Piping async action calls secquentially using Array.prototype.reduce
 * to chain and initial, empty promise
 *
 * @module store/plugins/undoRedo:getConfig
 * @function
 * @param {String} namespace - The name of the store module
 * @returns {Object} config - The object containing the undo/redo stacks of the store module
 */
export const getConfig: UndoRedoOptions | any = (paths: UndoRedoOptions[]) => (
  namespace: string
): object => paths.find(path => path.namespace === namespace) || {};

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
export const pipeActions = (store: any) => (actions: Array<any>) =>
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
export const setConfig = (paths: UndoRedoOptions[]) => {
  return (namespace: string, config: any, store: any = undefined) => {
    const pathIndex = paths.findIndex(path => path.namespace === namespace);
    paths.splice(pathIndex, 1, config);

    const { exposeUndoRedoConfig } = config;
    if (exposeUndoRedoConfig) {
      store.commit(`${namespace}${UPDATE_UNDO_REDO_CONFIG}`, config);
    }
  };
};

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

export const updateCanUndoRedo = ({
  paths,
  store
}: {
  paths: UndoRedoOptions[];
  store: any;
}) => (namespace: string) => {
  const undoEnabled = canUndo(paths)(namespace);
  const redoEnabled = canRedo(paths)(namespace);

  store.commit(`${namespace}${UPDATE_CAN_UNDO_REDO}`, {
    canUndo: undoEnabled
  });
  store.commit(`${namespace}${UPDATE_CAN_UNDO_REDO}`, {
    canRedo: redoEnabled
  });
};
