<!-- src/components/PiecesContainer.vue -->
<template>
    <div class="pieces-container" :class="{ vertical: isVertical }">
        <PieceView v-for="piece in pieces" :key="piece.name" :piece="piece" :size="50" />
    </div>
</template>

<script>
import PieceView from './PieceView.vue';

export default {
    name: 'PiecesContainer',
    components: {
        PieceView
    },
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
};
</script>

<style>
.pieces-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
}

.pieces-container.vertical {
    flex-direction: column;
}

.piece canvas {
    max-width: 100%;
    max-height: 100%;
    margin: 2px;
    border: 0px solid #ccc;
    /* Visual border for debugging; remove or adjust as needed */
}
</style>
