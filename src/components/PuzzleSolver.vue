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

export default {
    inject: ['initializedPieces'],
    data() {
        return {
            boardState: [
                ["1", "2", "2", ".", ".", "3", "3", "3", "3", "4", "4"],
                ["1", "2", ".", ".", ".", ".", "3", ".", "4", "4", "4"],
                ["1", "1", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "1", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
            ],
        };
    },
    methods: {
        solve() {
            const solution = solveBoard(this.boardState, this.initializedPieces);
            this.$emit('solution-found', solution);
        }
    },
};
</script>
