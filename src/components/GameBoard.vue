<!-- src/components/GameBoard.vue -->
<template>
  <div class="game-board">
    <canvas ref="canvas" width="550" height="275"></canvas> <!-- Adjust dimensions as needed -->
  </div>
</template>

<script>
export default {
  name: 'GameBoard',
  mounted() {
    this.drawBoard();
  },
  methods: {
    drawBoard() {
      const canvas = this.$refs.canvas;
      if (!canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      const cellSize = 50; // Assuming cell size matches piece size
      canvas.width = cellSize * 11;
      canvas.height = cellSize * 5;
      ctx.fillStyle = '#ddd'; // Light background for contrast
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw slots
      for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 5; j++) {
          ctx.beginPath();
          ctx.arc(cellSize * i + cellSize / 2, cellSize * j + cellSize / 2, cellSize / 2 * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
          ctx.fill();
          ctx.shadowBlur = 5;
          ctx.shadowColor = 'black';
          ctx.stroke();
          ctx.shadowBlur = 0; // Reset shadowBlur for next drawing
        }
      }
    },
  },
};
</script>

<style>
.game-board canvas {
  border: 1px solid #000;
}
</style>
