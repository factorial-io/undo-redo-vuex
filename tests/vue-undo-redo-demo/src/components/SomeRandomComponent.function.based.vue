<template>
  <div>
    <pre>CAUTION - only authenenticated users allowed</pre>
    <p>
      What is the ultimate answer of life, the universe, and everything?
    </p>
    <button v-if="isAuthenticated && !revealAnswer" @click="onShowAnswerClick">
      Show answer!
    </button>
    <template v-if="isAuthenticated && revealAnswer">
      <p>The ultimate answer of life, the universe, and everything is:</p>
      <h1>{{ ultimateAnswer }}</h1>
    </template>
  </div>
</template>


<script>
import { value, computed } from "vue-function-api";
import { useAuth } from "@/utils/utils-store";

export default {
  setup() {
    const { isAuthenticated } = useAuth();
    const revealAnswer = value(false);
    const ultimateAnswer = value(42);
    const onShowAnswerClick = () => {
      revealAnswer.value = true;
    };

    return {
      isAuthenticated,
      revealAnswer,
      ultimateAnswer,
      onShowAnswerClick
    };
  }
}
</script>
