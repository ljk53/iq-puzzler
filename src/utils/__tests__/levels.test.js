import { describe, it, expect } from 'vitest'
import { loadLevel, validateLevel, levels } from '../levels'
import { initializePieces } from '../piecesUtils'
import { createRectangularBoard } from '../board'
import { yToX, solve } from '../puzzleSolver'

const pieces = initializePieces()

describe('loadLevel', () => {
  it('parses a board-string level into board state', () => {
    const level = {
      id: 99,
      mode: '2d',
      difficulty: 'starter',
      board: [
        'AA.........',
        'A..........',
        '...........',
        '...........',
        '...........',
      ],
    }
    const state = loadLevel(level)
    expect(state[0][0]).toBe('A')
    expect(state[0][1]).toBe('A')
    expect(state[1][0]).toBe('A')
    expect(state[2][0]).toBe('.')
  })

  it('preserves all piece letters in board state', () => {
    const level = {
      id: 99,
      mode: '2d',
      difficulty: 'starter',
      board: [
        'AABBB......',
        'A.B........',
        '...........',
        '...........',
        '...........',
      ],
    }
    const state = loadLevel(level)
    expect(state[0][0]).toBe('A')
    expect(state[0][2]).toBe('B')
    expect(state[1][2]).toBe('B')
  })
})

describe('validateLevel', () => {
  it('validates a solvable level', () => {
    const level = {
      id: 99,
      mode: '2d',
      difficulty: 'test',
      board: [
        '...........',
        '...........',
        '...........',
        '...........',
        '...........',
      ],
    }
    const result = validateLevel(level, pieces)
    expect(result.valid).toBe(true)
    expect(result.solution).toHaveLength(12)
  }, 30000)

  it('validates a level with pre-placed pieces', () => {
    const level = {
      id: 99,
      mode: '2d',
      difficulty: 'test',
      board: [
        'LL.........',
        'L..........',
        '...........',
        '...........',
        '...........',
      ],
    }
    const result = validateLevel(level, pieces)
    expect(result.valid).toBe(true)
    expect(result.solution).toHaveLength(11) // 12 minus pre-placed L
  }, 30000)

  it('rejects an invalid level (impossible placement)', () => {
    const level = {
      id: 99,
      mode: '2d',
      difficulty: 'test',
      board: [
        'A..........',
        '...........',
        '...........',
        '...........',
        '...........',
      ],
    }
    // Single 'A' cell doesn't match any piece shape
    const result = validateLevel(level, pieces)
    expect(result.valid).toBe(false)
  }, 30000)
})

describe('built-in 2D levels', () => {
  const levels2d = levels.filter(l => l.mode === '2d')

  it('has at least 16 2D levels', () => {
    expect(levels2d.length).toBeGreaterThanOrEqual(16)
  })

  it('levels have required fields', () => {
    for (const level of levels2d) {
      expect(level.id).toBeTypeOf('number')
      expect(level.mode).toBe('2d')
      expect(level.difficulty).toBeTypeOf('string')
      expect(level.board).toHaveLength(5)
      for (const row of level.board) {
        expect(row).toHaveLength(11)
        expect(row).toMatch(/^[A-L.]+$/)
      }
    }
  })

  it('all 2D levels are solvable', () => {
    for (const level of levels2d) {
      const result = validateLevel(level, pieces)
      expect(result.valid, `Level ${level.id} should be solvable`).toBe(true)
    }
  }, 120000) // allow up to 2 min for all levels
})
