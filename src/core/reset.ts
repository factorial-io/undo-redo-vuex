import { RESET_STATE } from "./constants";
import { getConfig, setConfig, updateCanUndoRedo } from "./utils-undo-redo";

export default ({
  paths,
  store
}: {
  paths: UndoRedoOptions[];
  store: any;
}) => async (namespace: string) => {
  const config = getConfig(paths)(namespace);

  if (Object.keys(config).length) {
    const done: [] = [];
    const undone: [] = [];
    config.newMutation = false;
    store.commit(`${namespace}${RESET_STATE}`);

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
