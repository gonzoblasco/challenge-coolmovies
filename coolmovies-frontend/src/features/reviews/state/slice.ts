import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../../../generated/graphql';

export interface ReviewsState {
    movies: Movie[];
    loading: boolean;
    error?: string;
}

const initialState: ReviewsState = {
    movies: [],
    loading: false,
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
        },
        createReviewError: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const { actions } = slice;
export type SliceAction = typeof actions;
export default slice.reducer;
