<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <c-todos/>
  </div>
</template>

<script>
import CTodos from './components/CTodos.vue'

export default {
  name: 'App',
  components: {
    CTodos
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
