<template>
  <div id="app">
    <h1>A list app</h1>
    <input
      v-model="newItem"
      type="text"
      @keyup.enter="submitItem()"
    >
    <button
      :disabled="!canUndo"
      @click="undo"
    >
      Undo
    </button>
    <button
      :disabled="!canRedo"
      @click="redo"
    >
      Redo
    </button>
    <ul>
      <li
        v-for="(item, index) in list"
        :key="`list-${index}`"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";

export default {
  name: "App",
  data() {
    return {
      newItem: ""
    };
  },
  computed: {
    ...mapState("list", ["canUndo", "canRedo"]),
    ...mapGetters("list", {
      list: "getList"
    })
  },
  methods: {
    ...mapMutations("list", ["addItem"]),
    ...mapActions("list", ["undo", "redo"]),
    submitItem() {
      this.addItem({
        item: String(this.newItem)
      });
      this.newItem = "";
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin-bottom: 0.5px;
}
</style>
