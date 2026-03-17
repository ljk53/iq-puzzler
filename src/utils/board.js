// src/utils/board.js
// Board abstraction — decouples solver from grid geometry

/**
 * Create a rectangular board (standard 2D mode).
 * Cells are [row, col] coordinates.
 */
export function createRectangularBoard(rows, cols) {
  const cells = new Set()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.add(JSON.stringify([r, c]))
    }
  }

  function emptyState() {
    return Array.from({ length: rows }, () => Array(cols).fill('.'))
  }

  function canPlace(shape, r, c, state) {
    const sRows = shape.length
    const sCols = shape[0].length
    if (r + sRows > rows || c + sCols > cols) return false
    for (let i = 0; i < sRows; i++) {
      for (let j = 0; j < sCols; j++) {
        if (shape[i][j] === 'X' && state[r + i][c + j] !== '.') {
          return false
        }
      }
    }
    return true
  }

  function getValidPlacements(shape, state) {
    const sRows = shape.length
    const sCols = shape[0].length
    const placements = []
    for (let r = 0; r <= rows - sRows; r++) {
      for (let c = 0; c <= cols - sCols; c++) {
        if (canPlace(shape, r, c, state)) {
          const coveredCells = []
          for (let i = 0; i < sRows; i++) {
            for (let j = 0; j < sCols; j++) {
              if (shape[i][j] === 'X') {
                coveredCells.push(JSON.stringify([r + i, c + j]))
              }
            }
          }
          placements.push({ position: [r, c], coveredCells })
        }
      }
    }
    return placements
  }

  function generateY(state, pieces, excludePieces = new Set()) {
    const Y = {}
    pieces.forEach(piece => {
      if (excludePieces.has(piece.name)) return
      piece.shapes.forEach((shape, i) => {
        getValidPlacements(shape, state).forEach(({ position, coveredCells }) => {
          const key = JSON.stringify([piece.name, i, ...position])
          Y[key] = [piece.name, ...coveredCells]
        })
      })
    })
    return Y
  }

  function placeOnState(state, shape, r, c, value) {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[0].length; j++) {
        if (shape[i][j] === 'X') {
          state[r + i][c + j] = value
        }
      }
    }
  }

  return {
    type: 'rectangular',
    rows,
    cols,
    cells,
    emptyState,
    canPlace,
    getValidPlacements,
    generateY,
    placeOnState,
  }
}

/**
 * Create a pyramid board (top-down view of 5-layer pyramid).
 * Cells are [layer, row, col] coordinates.
 * Layer 0 (bottom): 5x5, Layer 1: 4x4, ..., Layer 4 (top): 1x1
 * Total: 55 cells.
 * Pieces lie flat within a single layer.
 */
export function createPyramidBoard() {
  const cells = new Set()
  const layerSizes = [5, 4, 3, 2, 1]

  for (let layer = 0; layer < 5; layer++) {
    const size = layerSizes[layer]
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        cells.add(JSON.stringify([layer, r, c]))
      }
    }
  }

  function emptyState() {
    return layerSizes.map(size =>
      Array.from({ length: size }, () => Array(size).fill('.'))
    )
  }

  function canPlace(shape, layer, r, c, state) {
    const size = layerSizes[layer]
    const sRows = shape.length
    const sCols = shape[0].length
    if (r + sRows > size || c + sCols > size) return false
    for (let i = 0; i < sRows; i++) {
      for (let j = 0; j < sCols; j++) {
        if (shape[i][j] === 'X' && state[layer][r + i][c + j] !== '.') {
          return false
        }
      }
    }
    return true
  }

  function getValidPlacements(shape, state) {
    const sRows = shape.length
    const sCols = shape[0].length
    const placements = []
    for (let layer = 0; layer < 5; layer++) {
      const size = layerSizes[layer]
      for (let r = 0; r <= size - sRows; r++) {
        for (let c = 0; c <= size - sCols; c++) {
          if (canPlace(shape, layer, r, c, state)) {
            const coveredCells = []
            for (let i = 0; i < sRows; i++) {
              for (let j = 0; j < sCols; j++) {
                if (shape[i][j] === 'X') {
                  coveredCells.push(JSON.stringify([layer, r + i, c + j]))
                }
              }
            }
            placements.push({ position: [layer, r, c], coveredCells })
          }
        }
      }
    }
    return placements
  }

  function generateY(state, pieces, excludePieces = new Set()) {
    const Y = {}
    pieces.forEach(piece => {
      if (excludePieces.has(piece.name)) return
      piece.shapes.forEach((shape, i) => {
        getValidPlacements(shape, state).forEach(({ position, coveredCells }) => {
          const key = JSON.stringify([piece.name, i, ...position])
          Y[key] = [piece.name, ...coveredCells]
        })
      })
    })
    return Y
  }

  function placeOnState(state, shape, layer, r, c, value) {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[0].length; j++) {
        if (shape[i][j] === 'X') {
          state[layer][r + i][c + j] = value
        }
      }
    }
  }

  /**
   * Convert pyramid [layer, row, col] to 2D screen coordinates
   * for top-down rendering. Each layer is offset by 0.5 cells.
   */
  function cellToScreen(layer, row, col) {
    const offset = layer * 0.5
    return { x: col + offset, y: row + offset, layer }
  }

  return {
    type: 'pyramid',
    layerSizes,
    cells,
    emptyState,
    canPlace,
    getValidPlacements,
    generateY,
    placeOnState,
    cellToScreen,
  }
}
