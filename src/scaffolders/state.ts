export const scaffoldState = (state: any, exposeUndoRedoConfig = false) => {
  const result = {
    ...state,
    canUndo: false,
    canRedo: false
  };

  if (exposeUndoRedoConfig) {
    result.undoRedoConfig = {};
  }

  return result;
};
