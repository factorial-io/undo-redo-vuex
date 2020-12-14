import { REDO, UNDO, CLEAR, RESET } from "../core/constants";
import execRedo from "../core/redo";
import execUndo from "../core/undo";
import execClear from "../core/clear";
import execReset from "../core/reset";
import { getConfig } from "../core/utils-undo-redo";

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

export const subscribeToActions = ({
  paths,
  store
}: {
  paths: UndoRedoOptions[];
  store: any;
}) => async (action: Action) => {
  const isStoreNamespaced = action.type.split("/").length > 1;
  const namespace = isStoreNamespaced ? `${action.type.split("/")[0]}/` : "";
  const matchNamespace = action.type.match(
    new RegExp(String.raw`${namespace}`, "g")
  );

  const execMap = {
    [String(REDO)]: canRedo(paths)(namespace) ? execRedo : undefined,
    [String(UNDO)]: canUndo(paths)(namespace) ? execUndo : undefined,
    [String(CLEAR)]: execClear,
    [String(RESET)]: execReset
  };

  const actionPattern = new RegExp(
    String.raw`(${REDO}|${UNDO}|${CLEAR}|${RESET})`,
    "g"
  );
  const pluginAction = action.type.match(actionPattern);

  if (matchNamespace && pluginAction) {
    const execution = execMap[String(pluginAction[0])];

    execution && execution({ paths, store })(namespace);
  }
};
