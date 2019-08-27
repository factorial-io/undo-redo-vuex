<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <todos-container />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import TodosContainer from "../components/Todos/Todos.container.vue";

export default Vue.extend({
  name: "home",
  components: { TodosContainer },
});
</script>
