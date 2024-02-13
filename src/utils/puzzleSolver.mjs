export function recognizeShapes(boardState, pieces) {
    const patterns = {};
    boardState.forEach((row, i) => {
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
                row.push(boardState[i][j] === pattern ? 'X' : '.');
            }
            shape.push(row);
        }

        function contains(container, target) {
            const targetStr = JSON.stringify(target);
            return container.some(element => JSON.stringify(element) === targetStr);
        }

        pieces.forEach(piece => {
            if (contains(piece.shapes, shape)) {
                state.pieceName = piece.name;
                foundPiecesSet.add(piece.name);
            }
        });
    });
    boardState.forEach(row => {
        row.forEach((cell, j) => {
            if (cell !== '.') {
                row[j] = patterns[cell].pieceName;
            }
        });
    });
    return foundPiecesSet;
}

export function generateY(boardState, pieces) {
    const boardRows = boardState.length;
    const boardCols = boardState[0].length;
    const Y = {};
    const foundPiecesSet = recognizeShapes(boardState, pieces);
    pieces.forEach(piece => {
        if (foundPiecesSet.has(piece.name)) {
            return;
        }
        piece.shapes.forEach((shape, i) => {
            generatePositions(shape, boardRows, boardCols, boardState).forEach(([r, c]) => {
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
}

export function generatePositions(shape, boardRows, boardCols, boardState) {
    const positions = [];
    const rows = shape.length;
    const cols = shape[0].length;
    for (let r = 0; r <= boardRows - rows; r++) {
        for (let c = 0; c <= boardCols - cols; c++) {
            if (canPlace(shape, r, c, boardState)) {
                positions.push([r, c]);
            }
        }
    }
    return positions;
}

export function canPlace(shape, r, c, boardState) {
    const rows = shape.length;
    const cols = shape[0].length;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (shape[i][j] === 'X' && boardState[r + i][c + j] !== '.') {
                return false;
            }
        }
    }
    return true;
}

export function yToX(Y) {
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
}

export function solve(X, Y, solution = []) {
    if (Object.keys(X).length === 0) {
        return solution.slice();
    } else {
        const c = Object.keys(X).reduce((a, b) =>
            X[a].size < X[b].size ? a : b
        );
        let result = null;
        Array.from(X[c]).some(r => {
            solution.push(r);
            const cols = select(X, Y, r);
            result = solve(X, Y, solution);
            if (result) {
                return true;
            }
            deselect(X, Y, r, cols);
            solution.pop();
        });
        return result;
    }
}

export function select(X, Y, r) {
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
}

export function deselect(X, Y, r, cols) {
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
}

export function populateBoard(solution, pieces, boardState) {
    const pieceMap = {};
    pieces.forEach(piece => {
        pieceMap[piece.name] = piece;
    });
    solution.forEach((key) => {
        const [pieceName, shapeId, r, c] = JSON.parse(key);
        const piece = pieceMap[pieceName];
        const shape = piece.shapes[shapeId];
        shape.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell === 'X') {
                    boardState[r + i][c + j] = piece.name;
                }
            });
        });
    });
    printBoard(boardState);
}

export function printBoard(boardState) {
    boardState.forEach(row => {
        console.log(row.join(''));
    });
}

export function solveBoard(boardState, pieces) {
    const Y = generateY(boardState, pieces);
    const X = yToX(Y);
    printBoard(boardState);
    const solution = solve(X, Y);
    populateBoard(solution, pieces, boardState);
    return solution;
}
