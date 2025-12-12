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
    usePrefetch: jest.fn(() => jest.fn()),
    useAllMoviesQuery: jest.fn(() => ({ data: { allMovies: { nodes: [] } }, isLoading: false, error: null })),
    useMovieReviewsQuery: jest.fn(() => ({ data: { movieById: { movieReviewsByMovieId: { nodes: [] } } }, isLoading: false, error: null })),
    useCurrentUserQuery: jest.fn(() => ({ data: { currentUser: null }, isLoading: false, error: null })),
    useAllUsersQuery: jest.fn(() => ({ data: { allUsers: { nodes: [] } }, isLoading: false, error: null })),
    useCreateReviewMutation: jest.fn(() => [jest.fn(() => ({ unwrap: jest.fn() })), { isLoading: false }]),
    useCreateCommentMutation: jest.fn(() => [jest.fn(() => ({ unwrap: jest.fn() })), { isLoading: false }]),
    useDeleteCommentMutation: jest.fn(() => [jest.fn(() => ({ unwrap: jest.fn() })), { isLoading: false }]),
    useDeleteReviewMutation: jest.fn(() => [jest.fn(() => ({ unwrap: jest.fn() })), { isLoading: false }]),
  },
}));
// Mock react-window and auto-sizer
jest.mock("react-virtualized-auto-sizer", () => ({ children }) =>
  children({ height: 1000, width: 1000 })
);

jest.mock("react-window", () => ({
  // react-window v2 API: uses List with rowComponent prop
  List: ({ rowComponent: RowComponent, rowCount, rowHeight, rowProps = {}, style, ...props }) => (
    <div data-testid="virtual-list" style={style}>
      {Array.from({ length: rowCount }).map((_, index) => (
        <RowComponent
          key={index}
          index={index}
          style={{ width: "100%", height: rowHeight }}
          {...rowProps}
        />
      ))}
    </div>
  ),
  // Keep Grid mock for backward compatibility if needed
  Grid: ({ cellComponent: CellComponent, rowCount, columnCount, rowHeight, columnWidth, cellProps = {}, style, ...props }) => (
    <div data-testid="virtual-grid" style={style}>
      {Array.from({ length: rowCount * columnCount }).map((_, i) => {
        const rowIndex = Math.floor(i / columnCount);
        const columnIndex = i % columnCount;
        return (
          <CellComponent
            key={i}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            style={{ width: columnWidth, height: rowHeight }}
            {...cellProps}
          />
        );
      })}
    </div>
  ),
}));
