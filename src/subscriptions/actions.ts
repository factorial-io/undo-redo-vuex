import { REDO, UNDO, CLEAR, RESET } from "../constants";
import execRedo from "../redo";
import execUndo from "../undo";
import execClear from "../clear";
import execReset from "../reset";
import { getConfig } from "../utils-undo-redo";

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
