<!-- src/components/PieceView.vue -->
<template>
    <canvas :width="canvasWidth" :height="canvasHeight" ref="canvas"></canvas>
</template>

<script>
export default {
    props: {
        piece: {
            type: Object,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        }
    },
    computed: {
        canvasWidth() {
            return this.piece.shape[0].length * this.size;
        },
        canvasHeight() {
            return this.piece.shape.length * this.size;
        }
    },
    mounted() {
        this.drawPiece();
    },
    methods: {
        drawPiece() {
            const canvas = this.$refs.canvas;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const { color, shape } = this.piece;
                const size = this.size;
                ctx.fillStyle = color;

                shape.forEach((row, y) => {
                    for (let x = 0; x < row.length; x++) {
                        if (row[x] === 'X') {
                            // Draw ball
                            ctx.beginPath();
                            ctx.arc(size / 2 + x * size, size / 2 + y * size, size / 2 * 0.8, 0, Math.PI * 2);
                            ctx.fillStyle = color;
                            ctx.fill();
                            ctx.closePath();

                            // Draw connecting lines if there is a neighboring 'X'
                            if (x < row.length - 1 && row[x + 1] === 'X') {
                                this.drawLine(ctx, size / 2 + x * size, size / 2 + y * size, size / 2 + (x + 1) * size, size / 2 + y * size, color);
                            }
                            if (y < shape.length - 1 && shape[y + 1][x] === 'X') {
                                this.drawLine(ctx, size / 2 + x * size, size / 2 + y * size, size / 2 + x * size, size / 2 + (y + 1) * size, color);
                            }
                        }
                    }
                });
            }
        },
        drawLine(ctx, startX, startY, endX, endY, color) {
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.closePath();
        },
    }
};
</script>
