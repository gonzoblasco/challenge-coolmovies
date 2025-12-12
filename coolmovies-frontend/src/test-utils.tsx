import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore, AppStore, RootState } from "./state/store";

jest.mock('./state/enhancedApi', () => ({
  enhancedApi: {
    reducer: (state: any = {}, action: any) => state || {},
    reducerPath: 'api',
    middleware: () => (next: any) => (action: any) => next(action),
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


// Mocks removed as they are unused by tests
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Create a new store instance for every test
    store = createStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>): React.JSX.Element {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
