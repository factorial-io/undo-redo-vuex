import Vue from "vue";
import { computed } from "vue-function-api";
import { plugin } from "vue-function-api";
import store from "@/store";

Vue.use(plugin);

export default () => {
  const useStore = () => store;
  const list = computed(() => store.state.list.list);
  const canUndo = computed(() => store.state.list.canUndo);
  const canRedo = computed(() => store.state.list.canRedo);
  const label = computed(() => (
    store.state.list.length ? "My Todos" : "You don't have any Todos yet"
  ));

  const undo = () => store.dispatch("list/undo");
  const redo = () => store.dispatch("list/redo");

  return {
    useStore,
    list,
    canUndo,
    canRedo,
    label,
    undo,
    redo
  };
};
