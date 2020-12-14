import { noop } from "../core/utils-undo-redo";

export const undo = noop;
export const redo = noop;
export const clear = noop;
export const reset = noop;
export const getUndoRedoConfig = noop;

export const scaffoldActions = (actions: any, exposeUndoRedoConfig = false) => {
  const result = {
    ...actions,
    undo,
    redo,
    clear,
    reset
  };

  if (exposeUndoRedoConfig) {
    result.getUndoRedoConfig = getUndoRedoConfig;
  }

  return result;
};
