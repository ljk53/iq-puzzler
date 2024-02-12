<template>
    <div class="pieces-container" :class="{ vertical: isVertical }">
        <div v-for="piece in pieces" :key="piece.name" class="piece">
            <canvas :ref="`canvas-${piece.name}`" :width="canvasWidth(piece.shape)"
                :height="canvasHeight(piece.shape)"></canvas>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PiecesContainer',
    props: {
        pieces: {
            type: Array,
            required: true,
        },
        isVertical: {
            type: Boolean,
            default: false,
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.pieces.forEach((piece) => {
                const canvas = this.$refs[`canvas-${piece.name}`][0];
                if (canvas) {
                    this.drawPiece(piece, canvas);
                }
            });
        });
    },
    methods: {
        drawPiece(piece, canvas) {
            const ctx = canvas.getContext('2d');
            const size = 50; // Size of each "ball" and space
            ctx.lineWidth = 10;

            piece.shape.forEach((row, y) => {
                for (let x = 0; x < row.length; x++) {
                    if (row[x] === 'X') {
                        // Draw ball
                        ctx.beginPath();
                        ctx.arc(size / 2 + x * size, size / 2 + y * size, size / 2 * 0.8, 0, Math.PI * 2);
                        ctx.fillStyle = piece.color;
                        ctx.fill();
                        ctx.closePath();

                        // Draw connecting lines if there is a neighboring 'X'
                        if (x < row.length - 1 && row[x + 1] === 'X') {
                            this.drawLine(ctx, size / 2 + x * size, size / 2 + y * size, size / 2 + (x + 1) * size, size / 2 + y * size, piece.color);
                        }
                        if (y < piece.shape.length - 1 && piece.shape[y + 1][x] === 'X') {
                            this.drawLine(ctx, size / 2 + x * size, size / 2 + y * size, size / 2 + x * size, size / 2 + (y + 1) * size, piece.color);
                        }
                    }
                }
            });
        },
        drawLine(ctx, startX, startY, endX, endY, color) {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.closePath();
        },
        canvasWidth(shape) {
            return shape[0].length * 50;
        },
        canvasHeight(shape) {
            return shape.length * 50;
        },
    },
};
</script>

<style>
.pieces-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.pieces-container.vertical {
    flex-direction: column;
}

.piece canvas {
    margin: 2px;
    border: 0px solid #ccc;
    /* Visual border for debugging; remove or adjust as needed */
}
</style>
