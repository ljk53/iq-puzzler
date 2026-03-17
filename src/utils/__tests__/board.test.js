import { describe, it, expect } from 'vitest'
import { createRectangularBoard, createPyramidBoard } from '../board'
import { initializePieces } from '../piecesUtils'
import { yToX, solve } from '../puzzleSolver'

describe('createRectangularBoard', () => {
  const board = createRectangularBoard(5, 11)

  it('has 55 cells', () => {
    expect(board.cells.size).toBe(55)
  })

  it('cells are [row, col] coordinate strings', () => {
    expect(board.cells.has(JSON.stringify([0, 0]))).toBe(true)
    expect(board.cells.has(JSON.stringify([4, 10]))).toBe(true)
    expect(board.cells.has(JSON.stringify([5, 0]))).toBe(false)
    expect(board.cells.has(JSON.stringify([0, 11]))).toBe(false)
  })

  it('creates an empty board state', () => {
    const state = board.emptyState()
    expect(state).toHaveLength(5)
    expect(state[0]).toHaveLength(11)
    expect(state.flat().every(c => c === '.')).toBe(true)
  })

  it('getValidPlacements for 1x1 shape returns 55 on empty board', () => {
    const state = board.emptyState()
    const shape = [['X']]
    const placements = board.getValidPlacements(shape, state)
    expect(placements).toHaveLength(55)
  })

  it('getValidPlacements for 1x2 shape returns 50 on empty board', () => {
    const state = board.emptyState()
    const shape = [['X', 'X']]
    const placements = board.getValidPlacements(shape, state)
    // 5 rows * (11-1) = 50
    expect(placements).toHaveLength(50)
  })

  it('getValidPlacements respects occupied cells', () => {
    const state = board.emptyState()
    state[2][5] = 'A'
    const shape = [['X']]
    const placements = board.getValidPlacements(shape, state)
    expect(placements).toHaveLength(54)
  })

  it('coveredCells returns correct cell keys', () => {
    const state = board.emptyState()
    const shape = [['X', 'X'], ['X', '.']]
    const placements = board.getValidPlacements(shape, state)
    const first = placements[0]
    expect(first.coveredCells).toContain(JSON.stringify([0, 0]))
    expect(first.coveredCells).toContain(JSON.stringify([0, 1]))
    expect(first.coveredCells).toContain(JSON.stringify([1, 0]))
    expect(first.coveredCells).toHaveLength(3)
  })
})

describe('createPyramidBoard', () => {
  const board = createPyramidBoard()

  it('has 55 cells (5x5 + 4x4 + 3x3 + 2x2 + 1x1)', () => {
    expect(board.cells.size).toBe(55)
  })

  it('cells use [layer, row, col] coordinates', () => {
    // Bottom layer (0): 5x5
    expect(board.cells.has(JSON.stringify([0, 0, 0]))).toBe(true)
    expect(board.cells.has(JSON.stringify([0, 4, 4]))).toBe(true)
    expect(board.cells.has(JSON.stringify([0, 5, 0]))).toBe(false)
    // Top layer (4): 1x1
    expect(board.cells.has(JSON.stringify([4, 0, 0]))).toBe(true)
    expect(board.cells.has(JSON.stringify([4, 1, 0]))).toBe(false)
  })

  it('layer sizes are correct', () => {
    for (let layer = 0; layer < 5; layer++) {
      const size = 5 - layer
      let count = 0
      board.cells.forEach(cell => {
        const [l] = JSON.parse(cell)
        if (l === layer) count++
      })
      expect(count).toBe(size * size)
    }
  })

  it('creates empty state as array of 5 layers', () => {
    const state = board.emptyState()
    expect(state).toHaveLength(5)
    expect(state[0]).toHaveLength(5)    // layer 0: 5 rows
    expect(state[0][0]).toHaveLength(5) // layer 0: 5 cols
    expect(state[4]).toHaveLength(1)    // layer 4: 1 row
    expect(state[4][0]).toHaveLength(1) // layer 4: 1 col
  })

  it('getValidPlacements for 1x1 shape returns 55 on empty board', () => {
    const state = board.emptyState()
    const shape = [['X']]
    const placements = board.getValidPlacements(shape, state)
    expect(placements).toHaveLength(55)
  })

  it('pieces only placed within a single layer', () => {
    const state = board.emptyState()
    const shape = [['X', 'X'], ['X', '.']]
    const placements = board.getValidPlacements(shape, state)
    for (const p of placements) {
      // All covered cells should be on the same layer
      const layers = p.coveredCells.map(c => JSON.parse(c)[0])
      expect(new Set(layers).size).toBe(1)
    }
  })

  it('3x3 shape fits on layers 0, 1, 2 but not 3 or 4', () => {
    const state = board.emptyState()
    const shape = [['X', 'X', 'X'], ['X', '.', '.'], ['X', '.', '.']]
    const placements = board.getValidPlacements(shape, state)
    const layers = new Set(placements.map(p => JSON.parse(p.coveredCells[0])[0]))
    // 5x5: 3*3=9, 4x4: 2*2=4, 3x3: 1*1=1 placements
    expect(layers.has(0)).toBe(true)
    expect(layers.has(1)).toBe(true)
    expect(layers.has(2)).toBe(true)  // fits exactly once on 3x3 layer
    expect(layers.has(3)).toBe(false) // 2x2 too small
    expect(layers.has(4)).toBe(false) // 1x1 too small
    expect(placements).toHaveLength(9 + 4 + 1)
  })
})

describe('board-agnostic solver integration', () => {
  it('rectangular board generates Y compatible with solver', () => {
    const board = createRectangularBoard(5, 11)
    const pieces = initializePieces()
    const state = board.emptyState()
    const Y = board.generateY(state, pieces)

    // Y should have entries
    expect(Object.keys(Y).length).toBeGreaterThan(100)

    // Each entry should have piece name + cell coordinates
    for (const [key, value] of Object.entries(Y)) {
      expect(value.length).toBeGreaterThan(1)
      // First element is piece name
      expect(value[0]).toMatch(/^[A-L]$/)
    }
  })

  it('pyramid board generates Y compatible with solver', () => {
    const board = createPyramidBoard()
    const pieces = initializePieces()
    const state = board.emptyState()
    const Y = board.generateY(state, pieces)

    expect(Object.keys(Y).length).toBeGreaterThan(100)

    for (const [key, value] of Object.entries(Y)) {
      expect(value[0]).toMatch(/^[A-L]$/)
      // All cell coords should be valid pyramid cells
      for (const cellKey of value.slice(1)) {
        expect(board.cells.has(cellKey)).toBe(true)
      }
    }
  })

  it('pyramid single-layer mode is unsolvable (pieces must span layers in real 3D)', () => {
    // In the real IQ Puzzler Pro, pyramid pieces span multiple layers
    // (a ball on layer 1 sits in the valley between 4 balls on layer 0).
    // Single-layer-only placement is unsolvable because the 1x1 top layer
    // can't hold any piece (smallest piece L has 3 cells).
    const board = createPyramidBoard()
    const pieces = initializePieces()
    const state = board.emptyState()
    const Y = board.generateY(state, pieces)
    const X = yToX(Y)
    const solution = solve(X, Y)
    expect(solution).toBeNull()
  })

  it('rectangular board solve via board abstraction matches original solver', () => {
    const board = createRectangularBoard(5, 11)
    const pieces = initializePieces()
    const state = board.emptyState()
    const Y = board.generateY(state, pieces)
    const X = yToX(Y)
    const solution = solve(X, Y)

    expect(solution).not.toBeNull()
    expect(solution).toHaveLength(12)

    const usedPieces = new Set(solution.map(key => JSON.parse(key)[0]))
    expect(usedPieces.size).toBe(12)

    const coveredCells = new Set()
    for (const key of solution) {
      for (const cellKey of Y[key].slice(1)) {
        expect(coveredCells.has(cellKey)).toBe(false)
        coveredCells.add(cellKey)
      }
    }
    expect(coveredCells.size).toBe(55)
  }, 30000)
})
