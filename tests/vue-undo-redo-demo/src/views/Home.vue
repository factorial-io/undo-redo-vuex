<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <input type="text" @keyup.enter.prevent="postNewTodo" v-model="newTodo" />
    <button @click.prevent="postNewTodo">Add</button>
    <button id="undo" :disabled="!canUndo" @click.prevent="undo">Undo</button>
    <button id="redo" :disabled="!canRedo" @click.prevent="redo">Redo</button>
    <h4>{{ header }}</h4>
    <ol>
      <li v-for="(todo, i) in list" :key="i">
        {{ todo }}
      </li>
    </ol>
  </div>
</template>

<script lang="ts">
import { mapState, mapMutations, mapActions } from "vuex";
import Vue from "vue";

export default Vue.extend({
  name: "home",
  computed: {
    ...mapState("list", ["list", "canUndo", "canRedo"]),
    header(): string {
      return this.list.length ? "My Todos" : "You don't have any Todos yet"
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
      this.addItem({ item: this.newTodo });
      this.newTodo = "";
    }
  }
});
</script>
