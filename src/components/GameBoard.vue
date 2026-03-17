<template>
  <div class="board-wrapper">
    <svg
      :viewBox="`0 0 ${cols * cellSize} ${rows * cellSize}`"
      class="board-svg"
      @pointerdown="onBoardClick"
    >
      <defs>
        <filter id="ball-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.4" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" rx="12" fill="#333" />

      <!-- Empty slots -->
      <circle
        v-for="(_, idx) in rows * cols"
        :key="'slot-' + idx"
        :cx="(idx % cols) * cellSize + cellSize / 2"
        :cy="Math.floor(idx / cols) * cellSize + cellSize / 2"
        :r="cellSize * 0.38"
        fill="#222"
        stroke="#444"
        stroke-width="0.5"
      />

      <!-- Placed pieces -->
      <template v-for="(row, r) in store.boardState" :key="'row-' + r">
        <!-- Connectors between adjacent same-piece cells -->
        <template v-for="(cell, c) in row" :key="'conn-' + r + '-' + c">
          <line
            v-if="cell !== '.' && c < cols - 1 && row[c + 1] === cell"
            :x1="c * cellSize + cellSize / 2"
            :y1="r * cellSize + cellSize / 2"
            :x2="(c + 1) * cellSize + cellSize / 2"
            :y2="r * cellSize + cellSize / 2"
            :stroke="pieceColor(cell)"
            :stroke-width="cellSize * 0.35"
            stroke-linecap="round"
          />
          <line
            v-if="cell !== '.' && r < rows - 1 && store.boardState[r + 1]?.[c] === cell"
            :x1="c * cellSize + cellSize / 2"
            :y1="r * cellSize + cellSize / 2"
            :x2="c * cellSize + cellSize / 2"
            :y2="(r + 1) * cellSize + cellSize / 2"
            :stroke="pieceColor(cell)"
            :stroke-width="cellSize * 0.35"
            stroke-linecap="round"
          />
        </template>

        <!-- Balls -->
        <circle
          v-for="(cell, c) in row"
          :key="'cell-' + r + '-' + c"
          v-show="cell !== '.'"
          :cx="c * cellSize + cellSize / 2"
          :cy="r * cellSize + cellSize / 2"
          :r="cellSize * 0.38"
          :fill="pieceColor(cell)"
          filter="url(#ball-shadow)"
          :class="{ 'removable': canRemove(cell) }"
        />
      </template>

      <!-- Ghost preview when piece is selected -->
      <template v-if="store.selectedPiece && ghostPos">
        <template v-for="(shapeRow, i) in currentShape" :key="'ghost-row-' + i">
          <circle
            v-for="(val, j) in shapeRow"
            :key="'ghost-' + i + '-' + j"
            v-show="val === 'X'"
            :cx="(ghostPos.col + j) * cellSize + cellSize / 2"
            :cy="(ghostPos.row + i) * cellSize + cellSize / 2"
            :r="cellSize * 0.38"
            :fill="store.selectedPiece.color"
            opacity="0.5"
          />
        </template>
      </template>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import { pieces as pieceDefs } from '../utils/piecesUtils'

const store = useGameStore()
const rows = 5
const cols = 11
const cellSize = 50
const ghostPos = ref(null)

const colorMap = Object.fromEntries(pieceDefs.map(p => [p.name, p.color]))

function pieceColor(name) {
  return colorMap[name] || '#555'
}

function canRemove(name) {
  if (!store.initialBoardState || name === '.') return false
  for (const row of store.initialBoardState) {
    for (const cell of row) {
      if (cell === name) return false
    }
  }
  return true
}

const currentShape = computed(() => {
  if (!store.selectedPiece) return null
  return store.selectedPiece.shapes[store.selectedShapeIndex]
})

function onBoardClick(e) {
  const svg = e.currentTarget
  const rect = svg.getBoundingClientRect()
  const scaleX = (cols * cellSize) / rect.width
  const scaleY = (rows * cellSize) / rect.height
  const x = (e.clientX - rect.left) * scaleX
  const y = (e.clientY - rect.top) * scaleY
  const col = Math.floor(x / cellSize)
  const row = Math.floor(y / cellSize)

  if (row < 0 || row >= rows || col < 0 || col >= cols) return

  // If a piece is selected, try to place it
  if (store.selectedPiece) {
    const placed = store.placePiece(row, col)
    if (placed) {
      ghostPos.value = null
    }
    return
  }

  // If clicking on a placed piece, try to remove it
  const cell = store.boardState[row]?.[col]
  if (cell && cell !== '.') {
    if (canRemove(cell)) {
      store.removePiece(cell)
    }
  }
}
</script>

<style scoped>
.board-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.board-svg {
  width: 100%;
  height: auto;
  border-radius: 12px;
  cursor: pointer;
}

.removable {
  cursor: pointer;
}

.removable:hover {
  filter: brightness(1.3);
}
</style>
