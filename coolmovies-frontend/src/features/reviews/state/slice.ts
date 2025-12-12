import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../../../generated/graphql';

export interface ReviewsState {
    // Only UI state that doesn't come from the server
    filterPanelOpen: boolean;
}

const initialState: ReviewsState = {
    filterPanelOpen: false,
};

export const slice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        toggleFilterPanel: (state) => {
            state.filterPanelOpen = !state.filterPanelOpen;
        },
    },
});

export const { actions } = slice;
export type SliceAction = typeof actions;
export default slice.reducer;
