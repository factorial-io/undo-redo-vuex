/* eslint-disable no-param-reassign, no-shadow */
import deepEqual from "fast-deep-equal";
import { scaffoldStore } from "../../../src/undoRedo";

const state = {
  list: [],
  shadow: []
};

const getters = {
  getList: ({ list }: { list: Array<any> }) => list,
  getItem: (state: any) => ({ item }: { item: any }) =>
    state.list.find((i: any) => deepEqual(i, item)),
  getShadow: ({ shadow }: { shadow: Array<any> }) => shadow
};

interface Context {
  commit: Function;
  state: any;
  getters: any;
  rootState: any;
  rootGetters: any;
}

interface Payload {
  index?: number;
  item?: any;
}

const actions = {
  // NB: add/remove shadow actions to test undo/redo callback actions
  addShadow({ commit }: Context, { item }: Payload) {
    commit("addShadow", { item });
  },
  removeShadow({ commit }: Context, { index }: Payload) {
    commit("removeShadow", { index });
  }
};

export const mutations = {
  emptyState: (state: any) => {
    state.list = [];
  },
  addItem: (state: any, { item }: { item: any }) => {
    state.list = [...state.list, item];
  },
  updateItem: (state: any, { item, index }: Payload) => {
    state.list.splice(index, 1, item);
  },
  removeItem: (state: any, { index }: Payload) => {
    state.list.splice(index, 1);
  },
  addShadow: (state: any, { item }: Payload) => {
    state.shadow = [...state.shadow, item];
  },
  removeShadow: (state: any, { index }: Payload) => {
    state.shadow.splice(index, 1);
  }
};

export default scaffoldStore({
  state,
  getters,
  actions,
  mutations,
  namespaced: true
});
