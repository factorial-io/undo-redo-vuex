import Vuex from "vuex";
import Vue from "vue";
import list from "./modules/list";
import undoRedo from "../../src/undoRedo";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  plugins: [
    undoRedo({
      paths: [
        {
          namespace: "list",
          ignoreMutations: ["addShadow", "removeShadow"]
        }
      ]
    })
  ],
  modules: {
    list
  },
  strict: debug
});
