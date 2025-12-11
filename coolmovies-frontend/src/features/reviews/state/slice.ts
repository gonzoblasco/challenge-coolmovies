import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../../../generated/graphql';

export interface ReviewsState {
    movies: Movie[];
    loading: boolean;
    error?: string;
    selectedMovieId: string | null;
    isWriteReviewOpen: boolean;
    isViewReviewsOpen: boolean;
}

const initialState: ReviewsState = {
    movies: [],
    loading: false,
    selectedMovieId: null,
    isWriteReviewOpen: false,
    isViewReviewsOpen: false,
};

export const slice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        fetchMovies: (state) => {
            state.loading = true;
            state.error = undefined;
        },
        fetchMoviesSuccess: (state, action: PayloadAction<Movie[]>) => {
            state.loading = false;
            state.movies = action.payload;
        },
        fetchMoviesError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        createReview: (state, action: PayloadAction<{ title: string; body: string; rating: number; movieId: string; userId: string }>) => {
            state.loading = true;
        },
        createReviewSuccess: (state) => {
            state.loading = false;
            state.isWriteReviewOpen = false;
            // Optimization: we could append the review locally, but refetching is safer/simpler for now as per example pattern
        },
        createReviewError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        openWriteReview: (state, action: PayloadAction<string>) => {
            state.selectedMovieId = action.payload;
            state.isWriteReviewOpen = true;
        },
        closeWriteReview: (state) => {
            state.isWriteReviewOpen = false;
            state.selectedMovieId = null;
        },
        openViewReviews: (state, action: PayloadAction<string>) => {
            state.selectedMovieId = action.payload;
            state.isViewReviewsOpen = true;
        },
        closeViewReviews: (state) => {
            state.isViewReviewsOpen = false;
            state.selectedMovieId = null;
        }
    },
});

export const { actions } = slice;
export type SliceAction = typeof actions;
export default slice.reducer;
