export const pieces = [
    { name: "A", color: "pink", shape: ["XX..", ".XXX"] },
    { name: "B", color: "cyan", shape: ["XXX", "XX."] },
    { name: "C", color: "orange", shape: ["X..", "XXX", ".X."] },
    { name: "D", color: "purple", shape: ["XX.", ".XX", "..X"] },
    { name: "E", color: "yellow", shape: ["XXXX", ".X.."] },
    { name: "F", color: "#DE3163", shape: ["XX.", ".XX"] },
    { name: "G", color: "green", shape: ["XXX", ".X."] },
    { name: "H", color: "blue", shape: ["XXX", "X..", "X.."] },
    { name: "I", color: "red", shape: ["XXXX", "X..."] },
    { name: "J", color: "olive", shape: ["XXX", "X.X"] },
    { name: "K", color: "darkBlue", shape: ["XXX", "X.."] },
    { name: "L", color: "#87CEEB", shape: ["XX", "X."] },
];

export function initializePieces() {
    return pieces.map(piece => ({
        ...piece,
        shapes: calculateTransformations(piece.shape),
    }));
}

function calculateTransformations(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    const newShapes = new Set();
    for (const [newRows, newCols, offset, rs, cs] of transforms(rows, cols)) {
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
    return Array.from(newShapes).map(JSON.parse);
}

function transforms(rows, cols) {
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
}
