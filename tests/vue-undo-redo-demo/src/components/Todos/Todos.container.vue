<template>
  <div>
    <input v-model="newTodo" type="text" @keyup.enter.prevent="postNewTodo">
    <todos v-bind="todoData" @postNewTodo="postNewTodo" @undo="undo" @redo="redo"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations, mapActions } from "vuex";
import Todos from "./Todos.vue";

export default Vue.extend({
  components: {
    Todos
  },
  computed: {
    ...mapState("list", ["list", "canUndo", "canRedo"]),
    label(): string {
      // @ts-ignore
      return this.list.length ? "My Todos" : "You don't have any Todos yet"
    },
    todoData(): any {
      return {
        // @ts-ignore
        list: this.list,
        // @ts-ignore
        canUndo: this.canUndo,
        // @ts-ignore
        canRedo: this.canRedo,
        label: this.label,
        // @ts-ignore
        newTodo: this.newTodo
      };
    }
  },
  data() {
    return {
      newTodo: ""
    };
  },
  methods: {
    ...mapMutations("list", ["addItem"]),
    ...mapActions("list", ["undo", "redo"]),
    postNewTodo() {
      // @ts-ignore
      this.addItem({ item: this.newTodo });
      this.newTodo = "";
    },
  }
});
</script>
