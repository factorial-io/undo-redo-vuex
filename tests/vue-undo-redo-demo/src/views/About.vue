<template>
  <div class="about">
    <some-random-component />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import SomeRandomComponent from "../components/SomeRandomComponent.vue";

export default Vue.extend({
  name: "home",
  components: { SomeRandomComponent },
});
</script>