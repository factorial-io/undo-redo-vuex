<template functional>
    <div>
        <button @click="listeners.postNewTodo">Add</button>
        <button
            id="undo"
            :disabled="!props.canUndo"
            @click="listeners.undo"
        >Undo</button>
        <button
            id="redo"
            :disabled="!props.canRedo"
            @click="listeners.redo"
        >Redo</button>
        <h4>{{ props.label }}</h4>
        <ol>
            <li v-for="(todo, i) in props.list" :key="i">{{ todo }}</li>
        </ol>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: "Todos"
});
</script>
