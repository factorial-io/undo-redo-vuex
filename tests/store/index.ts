import Vuex from "vuex";
import Vue from "vue";
import list from "./modules/list";
import auth from "./modules/auth";
import undoRedo from "../../src/undoRedo";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

const listUndoRedoConfig = {
  namespace: "list",
  ignoreMutations: ["addShadow", "removeShadow"]
};

export const store = {
  plugins: [
    undoRedo({
      paths: [listUndoRedoConfig]
    })
  ],
  modules: {
    list,
    auth
  },
  strict: debug
};

export const getExposedConfigStore = () => {
  return new Vuex.Store({
    plugins: [
      undoRedo({
        paths: [
          {
            ...listUndoRedoConfig,
            exposeUndoRedoConfig: true
          }
        ]
      })
    ],
    modules: {
      list,
      auth
    },
    strict: false
  });
};

export default new Vuex.Store({
  ...store,
  strict: false
});
