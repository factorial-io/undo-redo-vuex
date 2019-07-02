<template>
  <div>
    <input v-model="newTodo" type="text" @keyup.enter.prevent="postNewTodo">
    <todos v-bind="todoData" @postNewTodo="postNewTodo" @undo="undo" @redo="redo"/>
  </div>
</template>

<script>
import Vue from "vue";
import { value, computed } from "vue-function-api";
import { useStore, list, canUndo, canRedo, label, undo, redo } from "@/utils/utils-store";
import Todos from "./Todos.vue";

export default {
  components: {
    Todos
  },
  setup() {
    const newTodo = value("");
    const store = useStore();
    
    const todoData = computed(() => ({
      list: list.value,
      canUndo: canUndo.value,
      canRedo: canRedo.value,
      label: label.value,
      newTodo: newTodo.value
    }));

    const postNewTodo = () => {
      store.commit("list/addItem", {
        item: newTodo.value
      });
      newTodo.value = "";
    }

    return {
      newTodo, todoData, postNewTodo, undo, redo
    };
  }
};
</script>