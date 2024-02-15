<!-- src/components/PuzzleSolver.vue -->
<template>
    <div>
        <div v-for="(row, i) in boardState" :key="i">
            <span v-for="(cell, j) in row" :key="j">{{ cell }}</span>
        </div>
        <button @click="solve">Solve</button>
    </div>
</template>

<script>
import { solveBoard } from '../utils/puzzleSolver';
import { mapState } from 'vuex';

export default {
    inject: ['initializedPieces'],
    computed: {
        ...mapState(['boardState']),
    },
    methods: {
        solve() {
            const [newBoardState, solution] = solveBoard(JSON.parse(JSON.stringify(this.boardState)), this.initializedPieces);
            this.$store.dispatch('setBoardState', newBoardState);
            this.$emit('solution-found', solution);
        }
    },
};
</script>
