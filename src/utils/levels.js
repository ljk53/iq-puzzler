// src/utils/levels.js
// Level definitions and loader for IQ Puzzler Pro

import { createRectangularBoard } from './board'
import { yToX, solve, recognizeShapes, solveBoard } from './puzzleSolver'
import { initializePieces } from './piecesUtils'

/**
 * Parse a level definition into a board state (2D array).
 */
export function loadLevel(level) {
  return level.board.map(row => [...row])
}

/**
 * Validate that a level is solvable.
 * Returns { valid, solution, error? }
 */
export function validateLevel(level, pieces) {
  try {
    const boardState = loadLevel(level)
    const board = createRectangularBoard(5, 11)

    // Count distinct non-empty markers in the board
    const markers = new Set()
    for (const row of boardState) {
      for (const cell of row) {
        if (cell !== '.') markers.add(cell)
      }
    }

    // Recognize pre-placed pieces
    const foundPieces = recognizeShapes(boardState, pieces)

    // If any marker wasn't recognized as a valid piece, level data is bad
    if (foundPieces.size !== markers.size) {
      return { valid: false, error: `Unrecognized piece patterns on board (found ${foundPieces.size} of ${markers.size} markers)` }
    }

    // Generate solver constraints
    const Y = board.generateY(boardState, pieces, foundPieces)
    const X = yToX(Y)
    const solution = solve(X, Y)

    if (solution === null) {
      return { valid: false, error: 'No solution found' }
    }
    return { valid: true, solution }
  } catch (e) {
    return { valid: false, error: e.message }
  }
}

/**
 * Generate a level from a full solution by keeping only specified pieces.
 * @param {string[][]} solvedBoard - A fully solved 5x11 board
 * @param {string[]} keepPieces - Array of piece names to keep (e.g. ['A', 'B', 'C'])
 * @param {object} meta - Level metadata { id, difficulty }
 * @returns {object} Level definition
 */
export function generateLevel(solvedBoard, keepPieces, meta) {
  const keepSet = new Set(keepPieces)
  const board = solvedBoard.map(row =>
    row.map(cell => keepSet.has(cell) ? cell : '.').join('')
  )
  return {
    id: meta.id,
    mode: '2d',
    difficulty: meta.difficulty,
    board,
  }
}

// Generate levels from solver solutions.
// We solve the empty board, then create levels by keeping subsets of pieces.
function buildLevels() {
  const pieces = initializePieces()

  // Get a known solution
  const emptyBoard = Array.from({ length: 5 }, () => Array(11).fill('.'))
  const [solved] = solveBoard(emptyBoard, pieces)

  // Starter: keep 9-10 pieces (player places 2-3)
  // Junior: keep 6-7 pieces (player places 5-6)
  // Expert: keep 3-4 pieces (player places 8-9)
  // Master: keep 1-2 pieces (player places 10-11)
  // Wizard: keep 0 pieces (player places all 12)

  const allPieces = 'ABCDEFGHIJKL'.split('')

  return [
    // STARTER: keep 10, player places 2
    generateLevel(solved, allPieces.filter(p => !['F', 'L'].includes(p)),
      { id: 1, difficulty: 'starter' }),
    generateLevel(solved, allPieces.filter(p => !['A', 'E'].includes(p)),
      { id: 2, difficulty: 'starter' }),
    generateLevel(solved, allPieces.filter(p => !['G', 'K'].includes(p)),
      { id: 3, difficulty: 'starter' }),
    generateLevel(solved, allPieces.filter(p => !['B', 'I'].includes(p)),
      { id: 4, difficulty: 'starter' }),

    // JUNIOR: keep 7, player places 5
    generateLevel(solved, ['H', 'C', 'D', 'J', 'A', 'B', 'E'],
      { id: 5, difficulty: 'junior' }),
    generateLevel(solved, ['F', 'I', 'K', 'L', 'G', 'C', 'D'],
      { id: 6, difficulty: 'junior' }),
    generateLevel(solved, ['A', 'B', 'E', 'H', 'J', 'F', 'K'],
      { id: 7, difficulty: 'junior' }),
    generateLevel(solved, ['C', 'D', 'G', 'L', 'I', 'A', 'H'],
      { id: 8, difficulty: 'junior' }),

    // EXPERT: keep 4, player places 8
    generateLevel(solved, ['H', 'A', 'E', 'K'],
      { id: 9, difficulty: 'expert' }),
    generateLevel(solved, ['C', 'D', 'F', 'J'],
      { id: 10, difficulty: 'expert' }),
    generateLevel(solved, ['B', 'G', 'L', 'I'],
      { id: 11, difficulty: 'expert' }),
    generateLevel(solved, ['A', 'F', 'K', 'J'],
      { id: 12, difficulty: 'expert' }),

    // MASTER: keep 2, player places 10
    generateLevel(solved, ['H', 'E'],
      { id: 13, difficulty: 'master' }),
    generateLevel(solved, ['C', 'L'],
      { id: 14, difficulty: 'master' }),
    generateLevel(solved, ['D', 'K'],
      { id: 15, difficulty: 'master' }),
    generateLevel(solved, ['F', 'J'],
      { id: 16, difficulty: 'master' }),
  ]
}

export const levels = buildLevels()
