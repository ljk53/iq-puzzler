# IQ Puzzler Pro

A web-based solver and interactive player for [SmartGames IQ Puzzler Pro](https://www.smartgames.eu/uk/one-player-games/iq-puzzler-pro-0) — the puzzle game where you fit 12 pieces onto an 11×5 board.

**[Play it live →](https://ljk53.github.io/iq-puzzler/)**

## How the Solver Works

The core solver was hand-written in February 2024 as a learning project. It reduces IQ Puzzler to an **exact cover problem** and solves it with **Knuth's Algorithm X**.

### The Exact Cover Reduction

Placing 12 pieces onto 55 cells with no overlaps and no gaps is, by definition, an exact cover problem. We need to select a subset of "placement options" such that:

1. **Each of the 12 pieces is used exactly once** (12 constraints)
2. **Each of the 55 cells is covered exactly once** (55 constraints)

The solver builds a constraint matrix where:
- **Rows** = every possible way to place a piece (piece × rotation/reflection × board position)
- **Columns** = the 67 constraints (12 piece-usage + 55 cell-coverage)

### Algorithm X with MRV Heuristic

```
solve(X, Y):
    if X is empty: return solution     // all constraints satisfied
    c = column in X with fewest rows   // MRV: minimum remaining values
    for each row r that covers c:
        select(r)                       // cover all columns that r satisfies
        recurse
        deselect(r)                     // backtrack
```

The key optimization is the **MRV heuristic** — always branching on the most constrained column first. This prunes the search tree exponentially compared to naive backtracking.

The `select`/`deselect` operations maintain the constraint matrix using Set/Map operations (conceptually similar to Dancing Links but without the linked-list machinery). An empty 11×5 board solves in ~9ms.

### Piece Transformations

Each piece has up to 8 orientations (4 rotations × 2 reflections). The `calculateTransformations` function generates all unique orientations using stride-based matrix math — 8 hardcoded `[rows, cols, offset, rowStride, colStride]` tuples that map each `(r, c)` in the output to a position in the original shape array. Duplicates are eliminated via JSON string comparison.

### Shape Recognition

The solver can recognize pre-placed pieces on the board: `recognizeShapes` extracts the bounding box of each marker pattern, builds its 2D shape, and matches it against all known piece transformations. This enables the level system — a level is just a board with some cells pre-filled.

## Project History

### Phase 1: The Original Hand-Written Solver (Feb 2024)

The project started as a Vue.js learning exercise. Over 3 days:

| Commit | What happened |
|--------|--------------|
| `b7a96f0` init commit | Vue CLI scaffold |
| `9fdf0d9` add puzzle solver | First working Algorithm X implementation |
| `c93cd4d` simplify puzzle solver | Cleaned up the constraint matrix logic |
| `e9477cf` move pieces definition | Extracted 12 piece definitions to shared module |
| `77c2200` move puzzle solver | Separated solver utils from Vue components |
| `42a5091` save board state in vuex | Vuex store for board state |
| `1afe48f` Create PieceView component | Canvas-based piece rendering |

The solver was solid (Algorithm X is the right approach), but the UI was minimal — a canvas board, some canvas piece previews, and a "Solve" button.

### Phase 2: Claude Code Overhaul (Mar 2026)

A complete rewrite driven by [Claude Code](https://claude.ai/code), using a test-driven approach across 6 phases:

- **Phase 0**: Vue CLI → Vite + Vitest
- **Phase 1**: 54 unit tests locking down existing solver behavior
- **Phase 2**: Board abstraction (rectangular + pyramid). Key discovery: the 3D pyramid requires pieces to span multiple layers — single-layer placement is provably unsolvable since the 1×1 top layer can't hold any piece.
- **Phase 3**: Level system with auto-generated solvable challenges
- **Phase 4**: Vuex → Pinia
- **Phase 5**: Canvas → SVG, responsive layout, touch-friendly interaction
- **Phase 6**: Web Worker for non-blocking solver + Playwright E2E tests + GitHub Actions deployment

## Architecture

```
src/
  utils/
    piecesUtils.js      # 12 piece definitions + rotation/reflection transforms
    puzzleSolver.js     # Algorithm X exact cover solver (the original code)
    board.js            # Board abstraction (rectangular 11×5, pyramid 5-layer)
    levels.js           # Level system — generates solvable challenges from solutions
    __tests__/          # 54 unit tests (Vitest)
  stores/
    game.js             # Pinia store — game state, piece selection, solve action
  components/
    GameBoard.vue       # SVG board with touch support
    PieceTray.vue       # Available pieces with tap-to-select/rotate
    LevelSelector.vue   # Level grid grouped by difficulty
  workers/
    solver.worker.js    # Web Worker wrapper for non-blocking solve
  App.vue               # Root layout with level navigation
e2e/
  game.spec.js          # 12 Playwright E2E tests
```

## Development

```bash
npm install
npm run dev          # Vite dev server
npm run test         # Vitest watch mode
npm run test:run     # Vitest single run
npm run test:e2e     # Playwright E2E tests
npm run build        # Production build
```

## Known Limitations

- **Pyramid 3D mode not yet implemented** — pieces must span multiple layers in the real game, which requires a fundamentally different coordinate system than single-layer placement.
- **Level data is auto-generated** — the 16 built-in levels are derived from solver output, not transcribed from the official SmartGames booklet. Accurate transcription requires the physical game or higher-resolution images.

## License

MIT
