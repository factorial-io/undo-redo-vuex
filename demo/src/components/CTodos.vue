<template>
    <div>
        <h1>ToDo List</h1>
        <p>This basic example shows you how the Undo/Redo Vuex plugin works. Simply add your ToDo to the input field and
            hit the "Enter" key. You can then undo and redo those actions.</p>
        <form action="#">
            <input v-model="newTodo" type="text" placeholder="Add todo" @keyup.enter.prevent="addTodo">
            <button @click="undo" :disabled="!canUndo" type="button">Undo</button>
            <button @click="redo" :disabled="!canRedo" type="button">Redo</button>
        </form>
        <ul v-if="todos">
            <li v-for="(todo, index) in todos" :key="index">{{ todo }}</li>
        </ul>
    </div>
</template>

<script>
    import {mapActions, mapState} from "vuex";

    export default {
        data() {
            return {
                newTodo: ''
            }
        },
        computed: {
            ...mapState([
                'todos',
                'canUndo',
                'canRedo'
            ])
        },
        methods: {
            addTodo() {
                this.$store.commit('addTodo', this.newTodo);
                this.newTodo = '';
            },
            ...mapActions([
                'undo',
                'redo'
            ])
        }
    }
</script>