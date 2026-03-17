// src/stores/game.js
import { defineStore } from 'pinia'
import { initializePieces } from '../utils/piecesUtils'
import { levels, loadLevel } from '../utils/levels'
import { createRectangularBoard } from '../utils/board'

const allPieces = initializePieces()

export const useGameStore = defineStore('game', {
  state: () => ({
    mode: '2d',
    currentLevelIndex: 0,
    boardState: Array.from({ length: 5 }, () => Array(11).fill('.')),
    initialBoardState: null, // snapshot of level start state
    pieces: allPieces,
    selectedPieceIndex: null,
    selectedShapeIndex: 0,
    isSolving: false,
    isSolved: false,
  }),

  getters: {
    currentLevel: (state) => levels[state.currentLevelIndex] || null,
    levelCount: () => levels.length,
    availablePieces: (state) => {
      const placed = new Set()
      for (const row of state.boardState) {
        for (const cell of row) {
          if (cell !== '.') placed.add(cell)
        }
      }
      return state.pieces.filter(p => !placed.has(p.name))
    },
    placedPieceNames: (state) => {
      const placed = new Set()
      for (const row of state.boardState) {
        for (const cell of row) {
          if (cell !== '.') placed.add(cell)
        }
      }
      return placed
    },
    selectedPiece: (state) => {
      if (state.selectedPieceIndex === null) return null
      return state.pieces[state.selectedPieceIndex]
    },
  },

  actions: {
    loadLevel(index) {
      if (index < 0 || index >= levels.length) return
      this.currentLevelIndex = index
      const level = levels[index]
      this.boardState = loadLevel(level)
      this.initialBoardState = loadLevel(level) // independent copy
      this.selectedPieceIndex = null
      this.selectedShapeIndex = 0
      this.isSolved = false
    },

    resetLevel() {
      if (this.initialBoardState) {
        this.boardState = this.initialBoardState.map(row => [...row])
        this.selectedPieceIndex = null
        this.selectedShapeIndex = 0
        this.isSolved = false
      }
    },

    selectPiece(pieceIndex) {
      this.selectedPieceIndex = pieceIndex
      this.selectedShapeIndex = 0
    },

    deselectPiece() {
      this.selectedPieceIndex = null
      this.selectedShapeIndex = 0
    },

    rotateSelected() {
      if (this.selectedPiece === null) return
      const count = this.selectedPiece.shapes.length
      this.selectedShapeIndex = (this.selectedShapeIndex + 1) % count
    },

    placePiece(row, col) {
      if (this.selectedPiece === null) return false
      const piece = this.selectedPiece
      const shape = piece.shapes[this.selectedShapeIndex]
      const board = createRectangularBoard(5, 11)

      if (!board.canPlace(shape, row, col, this.boardState)) return false

      board.placeOnState(this.boardState, shape, row, col, piece.name)
      this.selectedPieceIndex = null
      this.selectedShapeIndex = 0
      this.checkSolved()
      return true
    },

    removePiece(pieceName) {
      // Don't allow removing initial pieces
      if (this.initialBoardState) {
        for (const row of this.initialBoardState) {
          for (const cell of row) {
            if (cell === pieceName) return false
          }
        }
      }
      for (const row of this.boardState) {
        for (let j = 0; j < row.length; j++) {
          if (row[j] === pieceName) row[j] = '.'
        }
      }
      this.isSolved = false
      return true
    },

    checkSolved() {
      this.isSolved = this.boardState.every(row =>
        row.every(cell => cell !== '.')
      )
    },

    solve() {
      if (this.isSolving) return
      this.isSolving = true
      const boardCopy = this.boardState.map(row => [...row])

      const worker = new Worker(
        new URL('../workers/solver.worker.js', import.meta.url),
        { type: 'module' }
      )
      worker.onmessage = (e) => {
        if (e.data.success) {
          this.boardState = e.data.boardState
          this.checkSolved()
        }
        this.isSolving = false
        worker.terminate()
      }
      worker.onerror = () => {
        this.isSolving = false
        worker.terminate()
      }
      worker.postMessage({ boardState: boardCopy })
    },
  },
})
