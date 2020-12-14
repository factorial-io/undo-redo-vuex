import {
  UPDATE_CAN_UNDO_REDO,
  UPDATE_UNDO_REDO_CONFIG
} from "../core/constants";
import { noop } from "../core/utils-undo-redo";

export const scaffoldMutations = (
  mutations: any,
  exposeUndoRedoConfig = false
) => {
  const result = {
    ...mutations,
    [UPDATE_CAN_UNDO_REDO]: (state: any, payload: any) => {
      if (payload.canUndo !== undefined) state.canUndo = payload.canUndo;
      if (payload.canRedo !== undefined) state.canRedo = payload.canRedo;
    },
    [UPDATE_UNDO_REDO_CONFIG]: noop
  };

  if (exposeUndoRedoConfig) {
    result[UPDATE_UNDO_REDO_CONFIG] = (
      state: any,
      { done, undone }: { done: any[]; undone: any[] }
    ) => {
      state.undoRedoConfig.done = done.slice();
      state.undoRedoConfig.undone = undone.slice();
    };
  }

  return result;
};
