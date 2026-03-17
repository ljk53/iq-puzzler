<template>
  <div class="piece-tray">
    <div class="tray-label">Available Pieces</div>
    <div class="tray-grid">
      <div
        v-for="piece in store.availablePieces"
        :key="piece.name"
        class="tray-piece"
        :class="{ selected: store.selectedPiece?.name === piece.name }"
        @pointerdown="onPieceClick(piece)"
      >
        <svg
          :viewBox="pieceViewBox(piece)"
          class="piece-svg"
        >
          <!-- Connectors -->
          <template v-for="(row, r) in displayShape(piece)" :key="'conn-' + r">
            <template v-for="(val, c) in row" :key="'c-' + r + '-' + c">
              <line
                v-if="val === 'X' && c < row.length - 1 && row[c + 1] === 'X'"
                :x1="c * 40 + 20" :y1="r * 40 + 20"
                :x2="(c + 1) * 40 + 20" :y2="r * 40 + 20"
                :stroke="piece.color" stroke-width="14" stroke-linecap="round"
              />
              <line
                v-if="val === 'X' && r < displayShape(piece).length - 1 && displayShape(piece)[r + 1]?.[c] === 'X'"
                :x1="c * 40 + 20" :y1="r * 40 + 20"
                :x2="c * 40 + 20" :y2="(r + 1) * 40 + 20"
                :stroke="piece.color" stroke-width="14" stroke-linecap="round"
              />
            </template>
          </template>
          <!-- Balls -->
          <template v-for="(row, r) in displayShape(piece)" :key="'ball-' + r">
            <circle
              v-for="(val, c) in row"
              :key="'b-' + r + '-' + c"
              v-show="val === 'X'"
              :cx="c * 40 + 20" :cy="r * 40 + 20"
              r="16"
              :fill="piece.color"
            />
          </template>
        </svg>
        <span class="piece-label">{{ piece.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/game'

const store = useGameStore()

function displayShape(piece) {
  if (store.selectedPiece?.name === piece.name) {
    return piece.shapes[store.selectedShapeIndex]
  }
  // Show original shape (first transformation which is identity)
  return piece.shapes[0]
}

function pieceViewBox(piece) {
  const shape = displayShape(piece)
  const w = shape[0].length * 40
  const h = shape.length * 40
  return `0 0 ${w} ${h}`
}

function onPieceClick(piece) {
  const idx = store.pieces.findIndex(p => p.name === piece.name)
  if (store.selectedPiece?.name === piece.name) {
    store.rotateSelected()
  } else {
    store.selectPiece(idx)
  }
}
</script>

<style scoped>
.piece-tray {
  background: #222;
  border-radius: 10px;
  padding: 8px;
}

.tray-label {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 6px;
  padding-left: 4px;
}

.tray-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tray-piece {
  background: #2a2a3a;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: border-color 0.15s, transform 0.15s;
  touch-action: manipulation;
  user-select: none;
}

.tray-piece:active {
  transform: scale(0.95);
}

.tray-piece.selected {
  border-color: #f0c040;
  background: #333350;
}

.piece-svg {
  width: auto;
  height: 50px;
}

.piece-label {
  font-size: 0.65rem;
  color: #aaa;
  margin-top: 2px;
}
</style>
