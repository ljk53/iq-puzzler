// src/store/index.mjs
import { createStore } from 'vuex';

export default createStore({
    state: {
        boardState: [
            ["1", "2", "2", ".", ".", "3", "3", "3", "3", "4", "4"],
            ["1", "2", ".", ".", ".", ".", "3", ".", "4", "4", "4"],
            ["1", "1", ".", ".", ".", ".", ".", ".", ".", ".", "."],
            [".", "1", ".", ".", ".", ".", ".", ".", ".", ".", "."],
            [".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
        ],
    },
    mutations: {
        updateBoardState(state, newBoardState) {
            // console.log("Before update board state", state.boardState);
            state.boardState = newBoardState;
            // console.log("After update board state", state.boardState);
        },
    },
    actions: {
        setBoardState({ commit }, newBoardState) {
            commit('updateBoardState', newBoardState);
        },
    },
});
