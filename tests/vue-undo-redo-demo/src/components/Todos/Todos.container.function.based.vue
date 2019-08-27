<template>
  <div>
    <template v-if="isAuthenticated">
      <input v-model="newTodo" type="text" @keyup.enter.prevent="postNewTodo">
      <todos v-bind="todoData" @postNewTodo="postNewTodo" @undo="undo" @redo="redo" @clear="clear" />
    </template>
    <button @click="() => (isAuthenticated ? logout() : login())">
      {{ isAuthenticated ? 'Logout' : 'Login' }}
    </button>
    <h1>{{ isAuthenticated ? '' : 'NOT' }} Logged In</h1>
  </div>
</template>

<script>
import { value, computed } from "vue-function-api";
import { useList, useAuth } from "@/utils/utils-store";
import Todos from "./Todos.vue";

export default {
  components: {
    Todos
  },
  setup() {
    const { useStore, list, canUndo, canRedo, label, undo, redo, clear } = useList();
    const { isAuthenticated, login, logout } = useAuth();
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
      newTodo,
      todoData,
      postNewTodo,
      undo,
      redo,
      clear,
      isAuthenticated,
      login,
      logout
    };
  }
};
</script>