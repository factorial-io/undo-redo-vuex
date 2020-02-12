import Vue from 'vue'
import Vuex from 'vuex'
import {default as undoRedo, scaffoldStore} from 'undo-redo-vuex';

Vue.use(Vuex);

const state = {
    todos: []
};

const actions = {};

const mutations = {
    addTodo(state, payload) {
        state.todos = [...state.todos, payload];
    },
    emptyState(state) {
        state.todos = [];
    }
};

export default new Vuex.Store(
    scaffoldStore({
        state,
        actions,
        mutations,
        plugins: [
            undoRedo()
        ]
    })
);

