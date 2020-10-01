/* eslint-disable no-param-reassign, no-shadow */

import Vuex from "vuex";
import Vue from "vue";
import deepEqual from "fast-deep-equal";
import undoRedo, { scaffoldStore } from "@/undoRedo";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

interface State {
  list: Array<any>;
  shadow: Array<any>;
  resetList?: Array<any>;
}

interface Payload {
  index: number;
  item?: any;
}

interface Context {
  commit: Function;
  state: any;
  getters: any;
  rootState: any;
  rootGetters: any;
}

const state: State = {
  list: [],
  shadow: [],
  resetList: undefined
};

const getters = {
  getList: ({ list }: State) => list,
  getItem: (state: State) => ({ item }: Payload) =>
    state.list.find(i => deepEqual(i, item)),
  getShadow: ({ shadow }: State) => shadow
};

const actions = {
  // NB: add/remove shadow actions to test undo/redo callback actions
  addShadow({ commit }: Context, { item }: Payload) {
    commit("addShadow", { item });
  },
  removeShadow({ commit }: Context, { index }: Payload) {
    commit("removeShadow", { index });
  }
};

const mutations = {
  emptyState: (state: State) => {
    state.list = [];
  },
  resetState: (state: State) => {
    state.resetList = [...state.list];
  },
  addItem: (state: State, { item }: Payload) => {
    state.list = [...state.list, item];
  },
  updateItem: (state: State, { item, index }: Payload) => {
    state.list.splice(index, 1, item);
  },
  removeItem: (state: State, { index }: Payload) => {
    state.list.splice(index, 1);
  },
  addShadow: (state: State, { item }: Payload) => {
    state.shadow = [...state.shadow, item];
  },
  removeShadow: (state: State, { index }: Payload) => {
    state.shadow.splice(index, 1);
  }
};

const exposeUndoRedoConfig = true;

export default new Vuex.Store(
  scaffoldStore(
    {
      plugins: [
        undoRedo({
          ignoreMutations: ["addShadow", "removeShadow"],
          exposeUndoRedoConfig
        })
      ],
      strict: debug,
      state,
      getters,
      actions,
      mutations
    },
    exposeUndoRedoConfig
  )
);
