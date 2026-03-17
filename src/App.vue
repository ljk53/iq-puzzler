<template>
  <div class="app">
    <header class="app-header">
      <h1>IQ Puzzler Pro</h1>
      <div class="level-nav">
        <button @click="prevLevel" :disabled="store.currentLevelIndex === 0">&lt;</button>
        <span class="level-info">
          Level {{ store.currentLevel?.id }}
          <small>{{ store.currentLevel?.difficulty }}</small>
        </span>
        <button @click="nextLevel" :disabled="store.currentLevelIndex >= store.levelCount - 1">&gt;</button>
      </div>
    </header>

    <main class="app-main">
      <GameBoard />
      <div class="controls">
        <div class="control-buttons">
          <button @click="store.solve()" :disabled="store.isSolving || store.isSolved">
            {{ store.isSolving ? 'Solving...' : 'Solve' }}
          </button>
          <button @click="store.resetLevel()">Reset</button>
          <button v-if="store.selectedPiece" @click="store.rotateSelected()">Rotate</button>
          <button v-if="store.selectedPiece" @click="store.deselectPiece()">Cancel</button>
        </div>
        <div v-if="store.isSolved" class="solved-banner">Solved!</div>
      </div>
      <PieceTray />
    </main>

    <LevelSelector />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGameStore } from './stores/game'
import GameBoard from './components/GameBoard.vue'
import PieceTray from './components/PieceTray.vue'
import LevelSelector from './components/LevelSelector.vue'

const store = useGameStore()

onMounted(() => {
  store.loadLevel(0)
})

function prevLevel() {
  store.loadLevel(store.currentLevelIndex - 1)
}
function nextLevel() {
  store.loadLevel(store.currentLevelIndex + 1)
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #1a1a2e;
  color: #eee;
  min-height: 100vh;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.app-header h1 {
  font-size: 1.4rem;
  color: #f0c040;
}

.level-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-info {
  font-size: 1rem;
  min-width: 100px;
  text-align: center;
}

.level-info small {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #aaa;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

button {
  background: #2a2a4a;
  color: #eee;
  border: 1px solid #444;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  touch-action: manipulation;
  user-select: none;
}

button:active {
  background: #3a3a6a;
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

.solved-banner {
  background: #2ecc40;
  color: #000;
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1.1rem;
  animation: pop 0.3s ease-out;
}

@keyframes pop {
  0% { transform: scale(0.8); }
  100% { transform: scale(1); }
}
</style>
