import { EMPTY_STATE } from "./constants";
import {
  getConfig,
  pipeActions,
  setConfig,
  updateCanUndoRedo
} from "./utils-undo-redo";

export default ({
  paths,
  store
}: {
  paths: UndoRedoOptions[];
  store: any;
}) => async (namespace: string) => {
  const config = getConfig(paths)(namespace);

  if (Object.keys(config).length) {
    const undoCallbacks = config.done.map(({ payload }: { payload: any }) => ({
      action: payload.undoCallback ? `${namespace}${payload.undoCallback}` : "",
      payload
    }));
    await pipeActions(store)(undoCallbacks);

    const done: [] = [];
    const undone: [] = [];
    config.newMutation = false;
    store.commit(`${namespace}${EMPTY_STATE}`);

    config.newMutation = true;
    setConfig(paths)(
      namespace,
      {
        ...config,
        done,
        undone
      },
      store
    );

    updateCanUndoRedo({ paths, store })(namespace);
  }
};
