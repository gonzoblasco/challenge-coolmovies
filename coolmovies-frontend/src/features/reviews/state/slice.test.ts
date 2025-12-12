import reducer, { actions, ReviewsState } from './slice';
import { Movie } from '../../../generated/graphql';

describe('reviews slice', () => {
  const initialState: ReviewsState = {
    movies: [],
    loading: false,
    selectedMovieId: null,
    isWriteReviewOpen: false,
    isViewReviewsOpen: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('fetchMovies', () => {
    it('should set loading to true', () => {
      const actual = reducer(initialState, actions.fetchMovies());
      expect(actual.loading).toBe(true);
      expect(actual.error).toBeUndefined();
    });
  });

  describe('fetchMoviesSuccess', () => {
    it('should set movies and loading to false', () => {
      const movies: Partial<Movie>[] = [
        { id: '1', title: 'Movie 1' },
        { id: '2', title: 'Movie 2' },
      ];
      const actual = reducer(
        { ...initialState, loading: true },
        actions.fetchMoviesSuccess(movies as Movie[])
      );
      expect(actual.loading).toBe(false);
      expect(actual.movies).toEqual(movies);
    });
  });

  describe('fetchMoviesError', () => {
    it('should set error and loading to false', () => {
      const error = 'Failed to fetch';
      const actual = reducer(
        { ...initialState, loading: true },
        actions.fetchMoviesError(error)
      );
      expect(actual.loading).toBe(false);
      expect(actual.error).toEqual(error);
    });
  });

  describe('createReview', () => {
    it('should set loading to true', () => {
      const actual = reducer(
        initialState,
        actions.createReview({
          title: 'Review',
          body: 'Body',
          rating: 5,
          movieId: '1',
          userId: 'u1',
        })
      );
      expect(actual.loading).toBe(true);
    });
  });

  describe('createReviewSuccess', () => {
    it('should set loading to false and close write review dialog', () => {
      const actual = reducer(
        { ...initialState, loading: true, isWriteReviewOpen: true },
        actions.createReviewSuccess()
      );
      expect(actual.loading).toBe(false);
      expect(actual.isWriteReviewOpen).toBe(false);
    });
  });

  describe('createReviewError', () => {
    it('should set error and loading to false', () => {
      const error = 'Failed to create';
      const actual = reducer(
        { ...initialState, loading: true },
        actions.createReviewError(error)
      );
      expect(actual.loading).toBe(false);
      expect(actual.error).toEqual(error);
    });
  });

  describe('openWriteReview', () => {
    it('should set selectedMovieId and open write review dialog', () => {
      const movieId = 'movie-123';
      const actual = reducer(initialState, actions.openWriteReview(movieId));
      expect(actual.selectedMovieId).toEqual(movieId);
      expect(actual.isWriteReviewOpen).toBe(true);
    });
  });

  describe('closeWriteReview', () => {
    it('should close write review dialog and clear selectedMovieId', () => {
      const actual = reducer(
        {
          ...initialState,
          selectedMovieId: 'movie-123',
          isWriteReviewOpen: true,
        },
        actions.closeWriteReview()
      );
      expect(actual.isWriteReviewOpen).toBe(false);
      expect(actual.selectedMovieId).toBeNull();
    });
  });

  describe('openViewReviews', () => {
    it('should set selectedMovieId and open view reviews dialog', () => {
      const movieId = 'movie-456';
      const actual = reducer(initialState, actions.openViewReviews(movieId));
      expect(actual.selectedMovieId).toEqual(movieId);
      expect(actual.isViewReviewsOpen).toBe(true);
    });
  });

  describe('closeViewReviews', () => {
    it('should close view reviews dialog and clear selectedMovieId', () => {
      const actual = reducer(
        {
          ...initialState,
          selectedMovieId: 'movie-456',
          isViewReviewsOpen: true,
        },
        actions.closeViewReviews()
      );
      expect(actual.isViewReviewsOpen).toBe(false);
      expect(actual.selectedMovieId).toBeNull();
    });
  });
});
