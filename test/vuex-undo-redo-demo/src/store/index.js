import Vuex from "vuex";
import Vue from "vue";
import undoRedo from "undo-redo-vuex";
import list from "./modules/list";

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
