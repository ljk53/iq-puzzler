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

export default {
  name: 'App',
  components: {
    PiecesContainer,
    GameBoard,
    PuzzleSolver
  },
  data() {
    return {
      // Define all 12 pieces
      pieces: [
        { name: "A", color: "pink", shape: ["XX..", ".XXX"] },
        { name: "B", color: "cyan", shape: ["XXX", "XX."] },
        { name: "C", color: "orange", shape: ["X..", "XXX", ".X."] },
        { name: "D", color: "purple", shape: ["XX.", ".XX", "..X"] },
        { name: "E", color: "yellow", shape: ["XXXX", ".X.."] },
        { name: "F", color: "#DE3163", shape: ["XX.", ".XX"] },
        { name: "G", color: "green", shape: ["XXX", ".X."] },
        { name: "H", color: "blue", shape: ["XXX", "X..", "X.."] },
        { name: "I", color: "red", shape: ["XXXX", "X..."] },
        { name: "J", color: "olive", shape: ["XXX", "X.X"] },
        { name: "K", color: "darkBlue", shape: ["XXX", "X.."] },
        { name: "L", color: "#87CEEB", shape: ["XX", "X."] },
      ],
      topPieces: [],
      bottomPieces: [],
      leftPieces: [],
      rightPieces: []
    };
  },
  mounted() {
    // Distribute pieces into top, bottom, left, and right containers
    this.topPieces = this.pieces.slice(0, 4);
    this.bottomPieces = this.pieces.slice(4, 8);
    this.leftPieces = this.pieces.slice(8, 10);
    this.rightPieces = this.pieces.slice(10, 12);
  },
  methods: {
    handleSolution(solution) {
      console.log(solution);
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
