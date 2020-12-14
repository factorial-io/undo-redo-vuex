import { scaffoldState } from "./state";
import { scaffoldMutations } from "./mutations";
import { scaffoldActions } from "./actions";

export { scaffoldState, scaffoldMutations, scaffoldActions };

export const scaffoldStore = (store: any, exposeUndoRedoConfig = false) => {
  const result = {
    ...store,
    state: scaffoldState(store.state || {}, exposeUndoRedoConfig),
    actions: scaffoldActions(store.actions || {}, exposeUndoRedoConfig),
    mutations: scaffoldMutations(store.mutations || {}, exposeUndoRedoConfig)
  };

  return result;
};
