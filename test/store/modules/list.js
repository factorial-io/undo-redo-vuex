/* eslint-disable no-param-reassign, no-shadow */
import deepEqual from 'fast-deep-equal';
import { scaffoldStore } from '../../../src/undoRedo';

const state = {
  list: [],
  shadow: [],
};

const getters = {
  getList: ({ list }) => list,
  getItem: state => ({ item }) => state.list.find(i => deepEqual(i, item)),
  getShadow: ({ shadow }) => shadow,
};

const actions = {
  // NB: add/remove shadow actions to test undo/redo callback actions
  addShadow({ commit }, { item }) {
    commit('addShadow', { item });
  },
  removeShadow({ commit }, { index }) {
    commit('removeShadow', { index });
  },
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
  },
};

export default scaffoldStore({
  state,
  getters,
  actions,
  mutations,
  namespaced: true,
});
