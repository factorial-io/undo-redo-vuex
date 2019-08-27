import Vue from "vue";
import { computed } from "vue-function-api";
import { plugin } from "vue-function-api";
import store from "@/store";

Vue.use(plugin);

export const useList = () => {
  const useStore = () => store;
  const list = computed(() => store.state.list.list);
  const canUndo = computed(() => store.state.list.canUndo);
  const canRedo = computed(() => store.state.list.canRedo);
  const label = computed(() => (
    store.state.list.length ? "My Todos" : "You don't have any Todos yet"
  ));

  const undo = () => store.dispatch("list/undo");
  const redo = () => store.dispatch("list/redo");
  const clear = () => store.dispatch("list/clear");

  return {
    useStore,
    list,
    canUndo,
    canRedo,
    label,
    undo,
    redo,
    clear
  };
};

export const useAuth = () => {
  const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);
  const login = () => store.dispatch("auth/login");
  const logout = () => store.dispatch("auth/logout");

  return { isAuthenticated, login, logout };
};
