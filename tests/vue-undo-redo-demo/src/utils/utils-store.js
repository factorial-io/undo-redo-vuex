import Vue from "vue";
import { computed } from "vue-function-api";
import { plugin } from "vue-function-api";
import store from "@/store";

Vue.use(plugin);

export const useStore = () => store;
export const list = computed(() => store.state.list.list);
export const canUndo = computed(() => store.state.list.canUndo);
export const canRedo = computed(() => store.state.list.canRedo);
export const label = computed(() => (
  store.state.list.length ? "My Todos" : "You don't have any Todos yet"
));

export const undo = () => store.dispatch("list/undo");
export const redo = () => store.dispatch("list/redo");
