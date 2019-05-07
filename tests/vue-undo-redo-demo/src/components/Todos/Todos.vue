<template>
  <div>
    <button id="post" @click="$emit('postNewTodo')">Add</button>
    <button id="undo" :disabled="!canUndo" @click="$emit('undo')">Undo</button>
    <button id="redo" :disabled="!canRedo" @click="$emit('redo')">Redo</button>
    <h4>{{ label }}</h4>
    <ol>
      <li v-for="(todo, i) in list" :key="i">{{ todo }}</li>
    </ol>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    list: {
      type: Array,
      required: true
    },
    canUndo: {
      type: Boolean,
      required: true
    },
    canRedo: {
      type: Boolean,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  }
})
</script>
