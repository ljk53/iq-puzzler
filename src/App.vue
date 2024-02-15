<!-- src/App.vue -->
<template>
    <div id="app">
        <div class="container">
            <div class="row top">
                <PiecesContainer :pieces="topPieces" />
            </div>
            <div class="main">
                <div class="column left">
                    <PiecesContainer :pieces="leftPieces" isVertical />
                </div>
                <GameBoard />
                <div class="column right">
                    <PiecesContainer :pieces="rightPieces" isVertical />
                </div>
            </div>
            <div class="row bottom">
                <PiecesContainer :pieces="bottomPieces" />
            </div>
        </div>
        <PuzzleSolver @solution-found="handleSolution" />
    </div>
</template>

<script>
import PiecesContainer from './components/PiecesContainer.vue';
import GameBoard from './components/GameBoard.vue';
import PuzzleSolver from './components/PuzzleSolver.vue';
import { initializePieces } from './utils/piecesUtils';
import { mapState } from 'vuex';

export default {
    name: 'App',
    components: {
        PiecesContainer,
        GameBoard,
        PuzzleSolver
    },
    data() {
        return {
            topPieces: [],
            bottomPieces: [],
            leftPieces: [],
            rightPieces: [],
            initializedPieces: initializePieces(),
        };
    },
    provide() {
        return {
            initializedPieces: this.initializedPieces,
        };
    },
    mounted() {
        // Distribute pieces into top, bottom, left, and right containers
        this.topPieces = this.initializedPieces.slice(0, 4);
        this.bottomPieces = this.initializedPieces.slice(4, 8);
        this.leftPieces = this.initializedPieces.slice(8, 10);
        this.rightPieces = this.initializedPieces.slice(10, 12);
    },
    computed: {
        ...mapState(['boardState']),
    },
    methods: {
        handleSolution(solution) {
            console.log("Found solution:", solution);
        }
    }
};
</script>

<style>
#app .container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.row {
    display: flex;
    justify-content: center;
}

.main {
    display: flex;
    align-items: center;
}

.column {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
