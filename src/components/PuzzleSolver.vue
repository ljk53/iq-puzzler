<template>
    <div>
        <div v-for="(row, i) in boardState" :key="i">
            <span v-for="(cell, j) in row" :key="j">{{ cell }}</span>
        </div>
        <button @click="solveBoard">Solve</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            pieces: [
                { "name": "A", "color": "pink", "shape": ["XX..", ".XXX"] },
                { "name": "B", "color": "cyan", "shape": ["XXX", "XX."] },
                { "name": "C", "color": "orange", "shape": ["X..", "XXX", ".X."] },
                { "name": "D", "color": "purple", "shape": ["XX.", ".XX", "..X"] },
                { "name": "E", "color": "yellow", "shape": ["XXXX", ".X.."] },
                { "name": "F", "color": "cherry", "shape": ["XX.", ".XX"] },
                { "name": "G", "color": "green", "shape": ["XXX", ".X."] },
                { "name": "H", "color": "blue", "shape": ["XXX", "X..", "X.."] },
                { "name": "I", "color": "red", "shape": ["XXXX", "X..."] },
                { "name": "J", "color": "olive", "shape": ["XXX", "X.X"] },
                { "name": "K", "color": "darkBlue", "shape": ["XXX", "X.."] },
                { "name": "L", "color": "sky", "shape": ["XX", "X."] },
            ],
            boardState: [
                ["1", "2", "2", ".", ".", "3", "3", "3", "3", "4", "4"],
                ["1", "2", ".", ".", ".", ".", "3", ".", "4", "4", "4"],
                ["1", "1", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", "1", ".", ".", ".", ".", ".", ".", ".", ".", "."],
                [".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
            ],
        };
    },
    methods: {
        generatePieces() {
            this.pieces.forEach(piece => {
                const shape = piece.shape;
                const rows = shape.length;
                const cols = shape[0].length;
                const newShapes = new Set();
                for (const [newRows, newCols, offset, rs, cs] of this.transforms(rows, cols)) {
                    const newShape = [];
                    for (let r = 0; r < newRows; r++) {
                        newShape.push(new Array(newCols).fill(0));
                        for (let c = 0; c < newCols; c++) {
                            const pos = offset + r * rs + c * cs;
                            const val = shape[Math.floor(pos / cols)][pos % cols];
                            newShape[r][c] = val;
                        }
                    }
                    newShapes.add(JSON.stringify(newShape));
                }
                piece.shapes = Array.from(newShapes).map(JSON.parse);
            });
        },
        transforms(rows, cols) {
            // rows, cols, offset, row-stride, col-stride
            return [
                [rows, cols, 0, cols, 1],
                [cols, rows, cols - 1, -1, cols],
                [rows, cols, rows * cols - 1, -cols, -1],
                [cols, rows, rows * cols - cols, 1, -cols],
                [cols, rows, 0, 1, cols],
                [rows, cols, cols - 1, cols, -1],
                [cols, rows, rows * cols - 1, -1, -cols],
                [rows, cols, rows * cols - cols, -cols, 1]
            ];
        },
        recognizeShapes() {
            const patterns = {};
            this.boardState.forEach((row, i) => {
                row.forEach((cell, j) => {
                    if (cell === '.') {
                        return;
                    }
                    if (!patterns[cell]) {
                        patterns[cell] = {
                            minRow: Number.MAX_SAFE_INTEGER,
                            minCol: Number.MAX_SAFE_INTEGER,
                            maxRow: -1,
                            maxCol: -1,
                            pieceName: ' ',
                        };
                    }
                    let s = patterns[cell];
                    s.minRow = Math.min(s.minRow, i);
                    s.minCol = Math.min(s.minCol, j);
                    s.maxRow = Math.max(s.maxRow, i);
                    s.maxCol = Math.max(s.maxCol, j);
                });
            });
            const foundPiecesSet = new Set();
            Object.entries(patterns).forEach(([pattern, state]) => {
                const shape = [];
                for (let i = state.minRow; i <= state.maxRow; i++) {
                    const row = [];
                    for (let j = state.minCol; j <= state.maxCol; j++) {
                        row.push(this.boardState[i][j] === pattern ? 'X' : '.');
                    }
                    shape.push(row);
                }

                function contains(container, target) {
                    const targetStr = JSON.stringify(target);
                    return container.some(element => JSON.stringify(element) === targetStr);
                }

                this.pieces.forEach(piece => {
                    if (contains(piece.shapes, shape)) {
                        state.pieceName = piece.name;
                        foundPiecesSet.add(piece.name);
                    }
                });
            });
            this.boardState.forEach(row => {
                row.forEach((cell, j) => {
                    if (cell !== '.') {
                        row[j] = patterns[cell].pieceName;
                    }
                });
            });
            return foundPiecesSet;
        },
        generateY() {
            const boardRows = this.boardState.length;
            const boardCols = this.boardState[0].length;
            const Y = {};
            const foundPiecesSet = this.recognizeShapes(this.boardState);
            this.pieces.forEach(piece => {
                if (foundPiecesSet.has(piece.name)) {
                    return;
                }
                piece.shapes.forEach((shape, i) => {
                    this.generatePositions(shape, boardRows, boardCols).forEach(([r, c]) => {
                        const key = JSON.stringify([piece.name, i, r, c]);
                        Y[key] = [piece.name].concat(
                            shape.flatMap((row, i) =>
                                row.map((cell, j) => cell === 'X' ? JSON.stringify([r + i, c + j]) : [])
                            ).filter(x => x.length)
                        );
                    });
                });
            });
            return Y;
        },
        generatePositions(shape, boardRows, boardCols) {
            const positions = [];
            const rows = shape.length;
            const cols = shape[0].length;
            for (let r = 0; r <= boardRows - rows; r++) {
                for (let c = 0; c <= boardCols - cols; c++) {
                    if (this.canPlace(shape, r, c)) {
                        positions.push([r, c]);
                    }
                }
            }
            return positions;
        },
        canPlace(shape, r, c) {
            const rows = shape.length;
            const cols = shape[0].length;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    if (shape[i][j] === 'X' && this.boardState[r + i][c + j] !== '.') {
                        return false;
                    }
                }
            }
            return true;
        },
        yToX(Y) {
            const X = {};
            Object.entries(Y).forEach(([key, value]) => {
                value.forEach(cell => {
                    if (!X[cell]) {
                        X[cell] = new Set();
                    }
                    X[cell].add(key);
                });
            });
            return X;
        },
        solve(X, Y, solution = []) {
            if (Object.keys(X).length === 0) {
                return solution.slice();
            } else {
                const c = Object.keys(X).reduce((a, b) =>
                    X[a].size < X[b].size ? a : b
                );
                let result = null;
                Array.from(X[c]).some(r => {
                    solution.push(r);
                    const cols = this.select(X, Y, r);
                    result = this.solve(X, Y, solution);
                    if (result) {
                        return true;
                    }
                    this.deselect(X, Y, r, cols);
                    solution.pop();
                });
                return result;
            }
        },
        select(X, Y, r) {
            const cols = [];
            Y[r].forEach(j => {
                X[j].forEach(i => {
                    Y[i].forEach(k => {
                        if (k !== j) {
                            X[k].delete(i);
                        }
                    });
                });
                cols.push(X[j]);
                delete X[j];
            });
            return cols;
        },
        deselect(X, Y, r, cols) {
            Y[r].slice().reverse().forEach(j => {
                X[j] = cols.pop();
                X[j].forEach(i => {
                    Y[i].forEach(k => {
                        if (k !== j) {
                            X[k].add(i);
                        }
                    });
                });
            });
        },
        populateBoard(solution) {
            const pieceMap = {};
            this.pieces.forEach(piece => {
                pieceMap[piece.name] = piece;
            });
            solution.forEach((key) => {
                const [pieceName, shapeId, r, c] = JSON.parse(key);
                const piece = pieceMap[pieceName];
                const shape = piece.shapes[shapeId];
                shape.forEach((row, i) => {
                    row.forEach((cell, j) => {
                        if (cell === 'X') {
                            this.boardState[r + i][c + j] = piece.name;
                        }
                    });
                });
            });
            this.printBoard();
        },
        printBoard() {
            this.boardState.forEach(row => {
                console.log(row.join(''));
            });
        },
        solveBoard() {
            this.generatePieces();
            const Y = this.generateY();
            const X = this.yToX(Y);
            this.printBoard();
            const solution = this.solve(X, Y);
            this.populateBoard(solution);
            this.$emit('solution-found', solution);
        },
    },
};
</script>
