<template>
  <div>
    <pre>CAUTION - only authenenticated users allowed</pre>
    <p>
      What is the ultimate answer of life, the universe, and everything?
    </p>
    <button v-if="$_auth_isAuthenticated && !revealAnswer" @click="onShowAnswerClick">
      Show answer!
    </button>
    <template v-if="$_auth_isAuthenticated && revealAnswer">
      <p>The ultimate answer of life, the universe, and everything is:</p>
      <h1>{{ ultimateAnswer }}</h1>
    </template>
  </div>
</template>


<script>
import { value, computed } from "vue-function-api";
import auth from "@/mixins/auth";

export default {
  mixins: [auth],
  data() {
    return {
      revealAnswer: false,
      ultimateAnswer: 42
    };
  },
  methods: {
    onShowAnswerClick() {
      this.revealAnswer = true;
    }
  }
}
</script>
