import Vuex from "vuex";
import Vue from "vue";
import list from "./modules/list";
import auth from "./modules/auth";
import undoRedo from "../../src/undoRedo";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export const store = {
  plugins: [
    undoRedo({
      paths: [
        {
          namespace: "list",
          ignoreMutations: ["addShadow", "removeShadow"],
          exposeUndoRedoConfig: true
        }
      ]
    })
  ],
  modules: {
    list,
    auth
  },
  strict: debug
};

export default new Vuex.Store({
  ...store,
  strict: false
});
