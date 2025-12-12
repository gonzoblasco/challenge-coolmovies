import "@testing-library/jest-dom";

// Mock IntersectionObserver
class IntersectionObserver {
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}

window.IntersectionObserver = IntersectionObserver;
global.IntersectionObserver = IntersectionObserver;

// Global Mock for enhancedApi to prevent Redux initialization crashes
// and provide default mock data for generated hooks.
jest.mock("./src/state/enhancedApi", () => ({
  enhancedApi: {
    reducer: (state = {}, action) => state || {},
    reducerPath: 'api',
    middleware: () => (next) => (action) => next(action),
    util: {
      getRunningQueriesThunk: () => () => { },
      getRunningMutationsThunk: () => () => { },
    },
    endpoints: {
      AllMovies: {
        initiate: jest.fn(() => ({ unwrap: jest.fn() })),
        select: jest.fn(() => ({ data: [], isLoading: false })),
      },
      MovieReviews: {
        initiate: jest.fn(() => ({ unwrap: jest.fn() })),
        select: jest.fn(() => ({ data: { nodes: [] }, isLoading: false })),
      },
      CreateReview: {
        initiate: jest.fn(() => ({ unwrap: jest.fn() })),
      }
    },
    useAllMoviesQuery: jest.fn(() => ({ data: { allMovies: { nodes: [] } }, isLoading: false, error: null })),
    useMovieReviewsQuery: jest.fn(() => ({ data: { movieById: { movieReviewsByMovieId: { nodes: [] } } }, isLoading: false, error: null })),
    useCreateReviewMutation: jest.fn(() => [jest.fn(() => ({ unwrap: jest.fn() })), { isLoading: false }]),
    useCreateCommentMutation: jest.fn(() => [jest.fn(() => ({ unwrap: jest.fn() })), { isLoading: false }]),
    useDeleteCommentMutation: jest.fn(() => [jest.fn(() => ({ unwrap: jest.fn() })), { isLoading: false }]),
    useDeleteReviewMutation: jest.fn(() => [jest.fn(() => ({ unwrap: jest.fn() })), { isLoading: false }]),
  },
}));
