// Web Worker for running the solver off the main thread
import { initializePieces } from '../utils/piecesUtils'
import { solveBoard, recognizeShapes } from '../utils/puzzleSolver'
import { createRectangularBoard } from '../utils/board'

const pieces = initializePieces()

self.onmessage = function (e) {
  const { boardState } = e.data
  try {
    const boardCopy = boardState.map(row => [...row])
    const [solved, solution] = solveBoard(boardCopy, pieces)
    self.postMessage({ success: true, boardState: solved, solution })
  } catch (err) {
    self.postMessage({ success: false, error: err.message })
  }
}
