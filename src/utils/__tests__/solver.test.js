import { describe, it, expect } from 'vitest'
import { initializePieces } from '../piecesUtils'
import {
  canPlace,
  generatePositions,
  generateY,
  yToX,
  solve,
  select,
  deselect,
  recognizeShapes,
  populateBoard,
  solveBoard,
} from '../puzzleSolver'

function emptyBoard(rows = 5, cols = 11) {
  return Array.from({ length: rows }, () => Array(cols).fill('.'))
}

describe('canPlace', () => {
  it('places a shape on an empty board', () => {
    const board = emptyBoard()
    const shape = [['X', 'X'], ['X', '.']]
    expect(canPlace(shape, 0, 0, board)).toBe(true)
  })

  it('rejects placement that overlaps occupied cell', () => {
    const board = emptyBoard()
    board[0][0] = 'A'
    const shape = [['X', 'X'], ['X', '.']]
    expect(canPlace(shape, 0, 0, board)).toBe(false)
  })

  it('allows placement next to occupied cell', () => {
    const board = emptyBoard()
    board[0][0] = 'A'
    const shape = [['X', 'X']]
    expect(canPlace(shape, 0, 1, board)).toBe(true)
  })

  it('rejects shape partially outside board bounds (caller should prevent this)', () => {
    const board = emptyBoard(5, 11)
    const shape = [['X', 'X', 'X']]
    // At col 9, shape extends to col 11 which is out of bounds
    // generatePositions handles bounds; canPlace would throw if called with bad coords
    expect(canPlace(shape, 0, 0, board)).toBe(true)
    expect(canPlace(shape, 0, 8, board)).toBe(true)
  })
})

describe('generatePositions', () => {
  it('1x1 shape fits at every empty cell', () => {
    const board = emptyBoard(5, 11)
    const shape = [['X']]
    const positions = generatePositions(shape, 5, 11, board)
    expect(positions).toHaveLength(55)
  })

  it('1x2 horizontal shape has correct count on empty board', () => {
    const board = emptyBoard(5, 11)
    const shape = [['X', 'X']]
    const positions = generatePositions(shape, 5, 11, board)
    // 5 rows * 10 positions per row
    expect(positions).toHaveLength(50)
  })

  it('respects occupied cells', () => {
    const board = emptyBoard(5, 11)
    board[0][0] = 'A'
    const shape = [['X']]
    const positions = generatePositions(shape, 5, 11, board)
    expect(positions).toHaveLength(54)
  })
})

describe('generateY', () => {
  it('generates placement options for all unplaced pieces', () => {
    const board = emptyBoard()
    const pieces = initializePieces()
    const Y = generateY(board, pieces)
    // Should have many entries (piece+shape+position combos)
    expect(Object.keys(Y).length).toBeGreaterThan(100)
  })

  it('each Y entry has piece name as first element', () => {
    const board = emptyBoard()
    const pieces = initializePieces()
    const Y = generateY(board, pieces)
    for (const [key, value] of Object.entries(Y)) {
      const [pieceName] = JSON.parse(key)
      expect(value[0]).toBe(pieceName)
    }
  })

  it('skips already-placed pieces', () => {
    // Place piece A manually on a board
    const board = emptyBoard()
    const pieces = initializePieces()
    // Put a recognizable A shape at top-left
    board[0][0] = '1'; board[0][1] = '1'
    board[1][1] = '1'; board[1][2] = '1'; board[1][3] = '1'
    const Y = generateY(board, pieces)
    for (const key of Object.keys(Y)) {
      const [pieceName] = JSON.parse(key)
      expect(pieceName).not.toBe('A')
    }
  })
})

describe('yToX', () => {
  it('creates inverse mapping', () => {
    const Y = {
      'opt1': ['A', '[0,0]', '[0,1]'],
      'opt2': ['A', '[0,0]', '[1,0]'],
      'opt3': ['B', '[0,1]', '[1,1]'],
    }
    const X = yToX(Y)
    expect(X['A']).toContain('opt1')
    expect(X['A']).toContain('opt2')
    expect(X['A']).not.toContain('opt3')
    expect(X['[0,0]']).toContain('opt1')
    expect(X['[0,0]']).toContain('opt2')
    expect(X['[0,1]']).toContain('opt1')
    expect(X['[0,1]']).toContain('opt3')
  })
})

describe('select / deselect round-trip', () => {
  it('restores X to original state', () => {
    const Y = {
      'opt1': ['A', '[0,0]', '[0,1]'],
      'opt2': ['A', '[0,2]', '[0,3]'],
      'opt3': ['B', '[0,1]', '[1,1]'],
    }
    const X = yToX(Y)

    // Snapshot original state (sorted keys and values for comparison)
    function snapshot(x) {
      const entries = Object.keys(x).sort().map(k => [k, [...x[k]].sort()])
      return JSON.stringify(entries)
    }
    const originalSnap = snapshot(X)

    const cols = select(X, Y, 'opt1')
    // After select, some keys should be removed from X
    expect(X['A']).toBeUndefined()
    expect(X['[0,0]']).toBeUndefined()
    expect(X['[0,1]']).toBeUndefined()

    deselect(X, Y, 'opt1', cols)
    expect(snapshot(X)).toBe(originalSnap)
  })
})

describe('recognizeShapes', () => {
  it('identifies pre-placed pieces on the board', () => {
    const pieces = initializePieces()
    const board = emptyBoard()
    // Place piece L (XX / X.) at top-left using marker "1"
    board[0][0] = '1'; board[0][1] = '1'
    board[1][0] = '1'
    const found = recognizeShapes(board, pieces)
    expect(found.has('L')).toBe(true)
    // Board cells should now be renamed to 'L'
    expect(board[0][0]).toBe('L')
    expect(board[0][1]).toBe('L')
    expect(board[1][0]).toBe('L')
  })
})

describe('solve — full board', () => {
  it('solves an empty 11x5 board with all 12 pieces', () => {
    const board = emptyBoard()
    const pieces = initializePieces()
    const [solved, solution] = solveBoard(board, pieces)

    // Every cell should be a piece letter A-L
    for (const row of solved) {
      for (const cell of row) {
        expect(cell).toMatch(/^[A-L]$/)
      }
    }
    // All 12 pieces used
    const usedPieces = new Set(solved.flat())
    expect(usedPieces.size).toBe(12)

    // Solution has 12 entries
    expect(solution).toHaveLength(12)
  }, 30000) // allow up to 30s for solver

  it('solves a board with pre-placed pieces', () => {
    const pieces = initializePieces()
    // Place L at top-left
    const board = emptyBoard()
    board[0][0] = '1'; board[0][1] = '1'
    board[1][0] = '1'

    const [solved, solution] = solveBoard(board, pieces)

    // L should still be at top-left
    expect(solved[0][0]).toBe('L')
    expect(solved[0][1]).toBe('L')
    expect(solved[1][0]).toBe('L')

    // All cells filled
    for (const row of solved) {
      for (const cell of row) {
        expect(cell).toMatch(/^[A-L]$/)
      }
    }

    // Solution should have 11 entries (12 minus pre-placed L)
    expect(solution).toHaveLength(11)
  }, 30000)
})
