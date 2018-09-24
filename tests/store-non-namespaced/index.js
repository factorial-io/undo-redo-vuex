/* eslint-disable no-param-reassign, no-shadow */

import Vuex from "vuex";
import Vue from "vue";
import deepEqual from "fast-deep-equal";
import undoRedo, { scaffoldStore } from "../../src/undoRedo";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

const state = {
  list: [],
  shadow: []
};

const getters = {
  getList: ({ list }) => list,
  getItem: state => ({ item }) => state.list.find(i => deepEqual(i, item)),
  getShadow: ({ shadow }) => shadow
};

const actions = {
  // NB: add/remove shadow actions to test undo/redo callback actions
  addShadow({ commit }, { item }) {
    commit("addShadow", { item });
  },
  removeShadow({ commit }, { index }) {
    commit("removeShadow", { index });
  }
};

const mutations = {
  emptyState: state => {
    state.list = [];
  },
  addItem: (state, { item }) => {
    state.list = [...state.list, item];
  },
  updateItem: (state, { item, index }) => {
    state.list.splice(index, 1, item);
  },
  removeItem: (state, { index }) => {
    state.list.splice(index, 1);
  },
  addShadow: (state, { item }) => {
    state.shadow = [...state.shadow, item];
  },
  removeShadow: (state, { index }) => {
    state.shadow.splice(index, 1);
  }
};

export default new Vuex.Store({
  plugins: [
    undoRedo({
      ignoreMutations: ["addShadow", "removeShadow"]
    })
  ],
  ...scaffoldStore({
    state,
    getters,
    actions,
    mutations
  }),
  strict: debug
});
