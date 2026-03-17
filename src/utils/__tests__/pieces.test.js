import { describe, it, expect } from 'vitest'
import { pieces, initializePieces } from '../piecesUtils'

describe('piece definitions', () => {
  it('defines exactly 12 pieces (A-L)', () => {
    expect(pieces).toHaveLength(12)
    const names = pieces.map(p => p.name)
    expect(names).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'])
  })

  it('every piece has name, color, and shape', () => {
    for (const piece of pieces) {
      expect(piece.name).toBeTruthy()
      expect(piece.color).toBeTruthy()
      expect(piece.shape).toBeInstanceOf(Array)
      expect(piece.shape.length).toBeGreaterThan(0)
    }
  })

  it('all shapes use only X and . characters', () => {
    for (const piece of pieces) {
      for (const row of piece.shape) {
        expect(row).toMatch(/^[X.]+$/)
      }
    }
  })

  it('all shapes have consistent row widths', () => {
    for (const piece of pieces) {
      const width = piece.shape[0].length
      for (const row of piece.shape) {
        expect(row.length).toBe(width)
      }
    }
  })

  it('total cells across all pieces equals 55 (fills 11x5 board)', () => {
    let total = 0
    for (const piece of pieces) {
      for (const row of piece.shape) {
        total += [...row].filter(c => c === 'X').length
      }
    }
    expect(total).toBe(55)
  })
})

describe('initializePieces', () => {
  const initialized = initializePieces()

  it('returns 12 pieces with shapes array', () => {
    expect(initialized).toHaveLength(12)
    for (const piece of initialized) {
      expect(piece.shapes).toBeInstanceOf(Array)
      expect(piece.shapes.length).toBeGreaterThan(0)
      expect(piece.shapes.length).toBeLessThanOrEqual(8)
    }
  })

  it('each transformation preserves cell count', () => {
    for (const piece of initialized) {
      const originalCount = piece.shape.reduce(
        (sum, row) => sum + [...row].filter(c => c === 'X').length, 0
      )
      for (const shape of piece.shapes) {
        const count = shape.reduce(
          (sum, row) => sum + row.filter(c => c === 'X').length, 0
        )
        expect(count).toBe(originalCount)
      }
    }
  })

  it('no duplicate transformations within a piece', () => {
    for (const piece of initialized) {
      const serialized = piece.shapes.map(s => JSON.stringify(s))
      const unique = new Set(serialized)
      expect(unique.size).toBe(piece.shapes.length)
    }
  })

  it('transformations have no empty padding rows or columns', () => {
    for (const piece of initialized) {
      for (const shape of piece.shapes) {
        // No all-dot rows
        for (const row of shape) {
          expect(row.some(c => c === 'X')).toBe(true)
        }
        // No all-dot columns
        const cols = shape[0].length
        for (let c = 0; c < cols; c++) {
          const hasX = shape.some(row => row[c] === 'X')
          expect(hasX).toBe(true)
        }
      }
    }
  })

  it('symmetric piece G (T-shape) has exactly 4 orientations', () => {
    const g = initialized.find(p => p.name === 'G')
    expect(g.shapes).toHaveLength(4)
  })

  it('asymmetric piece A has 8 orientations', () => {
    const a = initialized.find(p => p.name === 'A')
    expect(a.shapes).toHaveLength(8)
  })

  it('piece F (S-shape) has 4 orientations (2 rotations x 2 reflections, some coincide)', () => {
    const f = initialized.find(p => p.name === 'F')
    // S-shape: rotation by 90 gives a different shape, but 180 gives the same as reflected
    expect(f.shapes.length).toBeGreaterThanOrEqual(2)
    expect(f.shapes.length).toBeLessThanOrEqual(4)
  })

  it('piece L (small L-triomino) has exactly 4 orientations', () => {
    const l = initialized.find(p => p.name === 'L')
    expect(l.shapes).toHaveLength(4)
  })
})
