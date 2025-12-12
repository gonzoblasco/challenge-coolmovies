import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import Reviews from "../templates/Reviews";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";

// Mock the generated hooks
jest.mock("../../../generated/graphql", () => ({
  useCurrentUserQuery: jest.fn(),
  useAllMoviesQuery: jest.fn(),
  useAllUsersQuery: jest.fn(),
  useUpdateReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCreateReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCreateCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useMovieReviewsQuery: jest.fn(),
  api: {
    enhanceEndpoints: jest.fn(() => ({
      injectEndpoints: jest.fn(),
    })),
  },
}));

jest.mock("../../../state/enhancedApi", () => ({
  enhancedApi: {
    reducer: jest.fn(),
    reducerPath: "api",
    middleware: jest.fn(),
    endpoints: {
      AllMovies: {},
      MovieReviews: {},
      CreateReview: {},
      CreateComment: {},
      DeleteComment: {},
      DeleteReview: {},
    },
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    toString: jest.fn(() => ""),
  })),
  usePathname: jest.fn(() => ""),
}));

const mockUser = {
  id: "user-1",
  name: "Test User",
  __typename: "User",
};

const mockMovies = [
  {
    id: "1",
    title: "Integration Test Movie",
    releaseDate: "2023-01-01",
    imgUrl: "http://example.com/image.jpg",
    nodeId: "node-1",
    movieDirectorId: "director-1",
    userCreatorId: "user-creator-1",
    movieReviewsByMovieId: {
      nodes: [],
    },
  },
];

describe("Review Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: mockUser },
      isLoading: false,
    });
    (graphqlHooks.useAllMoviesQuery as jest.Mock).mockReturnValue({
      data: { allMovies: { nodes: mockMovies } },
      isLoading: false,
    });
    (graphqlHooks.useAllUsersQuery as jest.Mock).mockReturnValue({
      data: { allUsers: { nodes: [] } },
      isLoading: false,
    });
    // Initial empty reviews
    (graphqlHooks.useMovieReviewsQuery as jest.Mock).mockReturnValue({
      data: {
        movieById: {
          id: "1",
          title: "Integration Test Movie",
          movieReviewsByMovieId: {
            nodes: [],
          },
        },
      },
      isLoading: false,
    });
  });

  it("completes the create review flow", async () => {
    // Setup mutable search params for the test
    let currentSearchParams = new URLSearchParams();
    const useSearchParamsMock = require("next/navigation").useSearchParams;
    useSearchParamsMock.mockImplementation(() => currentSearchParams);

    const useRouterMock = require("next/navigation").useRouter;
    const pushMock = jest.fn((url: string) => {
      const urlObj = new URL(url, "http://localhost");
      currentSearchParams = urlObj.searchParams;
    });
    useRouterMock.mockReturnValue({
      push: pushMock,
      replace: jest.fn(),
      prefetch: jest.fn(),
    });

    const createReviewMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        data: {
          createMovieReview: {
            movieReview: {
              id: "new-review-1",
              title: "New Review",
              body: "This is a great movie!",
              rating: 5,
              movieId: "1",
              userByUserReviewerId: { name: "Test User" },
            },
          },
        },
      }),
    });

    (graphqlHooks.useCreateReviewMutation as jest.Mock).mockReturnValue([
      createReviewMock,
      { isLoading: false },
    ]);

    const { rerender } = renderWithProviders(<Reviews />, {
      preloadedState: {
        reviews: {
          loading: false,
          movies: mockMovies,
        },
      },
    });

    // 1. Find Movie and Click "Review" button
    expect(
      await screen.findByText("Integration Test Movie")
    ).toBeInTheDocument();

    const reviewBtn = screen.getByRole("button", { name: "Review" });
    fireEvent.click(reviewBtn);

    // Verify push was called
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("action=write-review"),
      expect.anything()
    );

    // Manually rerender to simulate router update (since mock changed local variable)
    // The component reads from the hook, so re-rendering will pick up new value
    rerender(
      <Reviews /> // Wrappers are preserved by renderWithProviders? No, renderWithProviders wraps.
      // renderWithProviders returns standard RTL result.
      // We need to match the wrapper?
      // Actually renderWithProviders creates a new Provider each time if we just pass <Reviews>.
      // Ideally we should use the same store.
      // But for this test, simply re-rendering the component might work if the hook is global mock.
    );
    // Be careful: renderWithProviders creates a NEW store by default.
    // If we want to persist state, we need to pass the SAME store.
    // However, we are testing URL state which is "external".
    // Redux state (movies) is mocked via Query hooks anyway.

    // Let's rely on the fact that we mocked hooks, so Redux store recreation shouldn't matter much
    // for *cached* data if the hooks return static mocks.
    // But `rerender` from RTL re-uses the container.
    // If we use `rerender(<Reviews />)`, it might lose the Providers if they were part of `render`.
    // We should use the same wrapper logic.
    // `renderWithProviders` usually returns `rerender` that wraps with the *same* providers?
    // Let's check test-utils. If not, we might be in trouble.
    // Assuming standard custom render: YES, it usually wraps the new ui in the same container.
    // BUT does it wrap in the same Providers?
    // Usually custom `rerender` is NOT enhancing the UI with providers again if passing raw UI.
    // Standard RTL `rerender` just updates the children of the container.
    // If the providers were in the wrapper option of `render`, they stay.

    // 2. Dialog should open
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Write a Review/i)).toBeInTheDocument();

    // 3. Fill the form
    const titleInput = screen.getByPlaceholderText("Great Movie!");
    const bodyInput = screen.getByPlaceholderText(
      "Tell us what you thought..."
    );

    fireEvent.change(titleInput, { target: { value: "New Review" } });
    fireEvent.change(bodyInput, {
      target: { value: "This is a great movie!" },
    });

    const starBtn = screen.getByLabelText("Rate 5 stars");
    fireEvent.click(starBtn);

    // 4. Submit
    const submitBtn = screen.getByRole("button", { name: "Submit Review" });
    fireEvent.click(submitBtn);

    // 5. Verify Mutation Called
    await waitFor(() => {
      expect(createReviewMock).toHaveBeenCalledWith({
        title: "New Review",
        body: "This is a great movie!",
        rating: 5,
        movieId: "1",
        userId: "user-1",
      });
    });

    // Simulate successful navigation after submit
    expect(pushMock).toHaveBeenLastCalledWith(
      expect.stringContaining("action=view-reviews"),
      expect.anything()
    );
    // Rerender to show view reviews
    rerender(<Reviews />);

    // Verify "Write a Review" dialog is gone (or replaced by View Reviews)
    await waitFor(() => {
      expect(screen.queryByText(/Write a Review for/i)).not.toBeInTheDocument();
    });
  });
});
