import {
  EMPTY_STATE,
  UPDATE_CAN_UNDO_REDO,
  UPDATE_UNDO_REDO_CONFIG
} from "../core/constants";
import { getConfig, setConfig, updateCanUndoRedo } from "../core/utils-undo-redo";

export const subscribeToMutations = ({
  paths,
  store
}: {
  paths: UndoRedoOptions[];
  store: any;
}) => (mutation: Mutation) => {
  const isStoreNamespaced = mutation.type.split("/").length > 1;
  const namespace = isStoreNamespaced ? `${mutation.type.split("/")[0]}/` : "";
  const config = getConfig(paths)(namespace);
  const hasConfig = Object.keys(config).length;

  if (hasConfig) {
    const { ignoreMutations, newMutation, done } = config;

    // Check mutation type
    const isEmptyStateMutation = mutation.type === `${namespace}${EMPTY_STATE}`;
    const isUpdateCanUndoRedoMutation =
      mutation.type === `${namespace}${UPDATE_CAN_UNDO_REDO}`;
    const isUpdateUndoRedoConfig =
      mutation.type === `${namespace}${UPDATE_UNDO_REDO_CONFIG}`;
    const isIgnoredMutations = ignoreMutations.indexOf(mutation.type) > -1;

    const isUserMutation = ![
      isEmptyStateMutation,
      isUpdateCanUndoRedoMutation,
      isUpdateUndoRedoConfig,
      isIgnoredMutations
    ].some(value => value);
    const hasNamespace = mutation.type.includes(namespace);
    const isMutationValid = isUserMutation && hasNamespace && newMutation;

    if (isMutationValid) {
      done.push(mutation);

      setConfig(paths)(
        namespace,
        {
          ...config,
          done
        },
        store
      );

      updateCanUndoRedo({ paths, store })(namespace);
    }
  }
};
