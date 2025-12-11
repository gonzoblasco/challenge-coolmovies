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
    const createReviewMock = jest.fn().mockResolvedValue({
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
    });

    (graphqlHooks.useCreateReviewMutation as jest.Mock).mockReturnValue([
      createReviewMock,
      { isLoading: false },
    ]);

    renderWithProviders(<Reviews />, {
      preloadedState: {
        reviews: {
          loading: false,
          movies: mockMovies,
          selectedMovieId: null,
          isWriteReviewOpen: false,
          isViewReviewsOpen: false,
        },
      },
    });

    // 1. Find Movie and Click "Review" button (triggers write review dialog)
    // IMPORTANT: The "Review" button is on the MovieCard.
    expect(
      await screen.findByText("Integration Test Movie")
    ).toBeInTheDocument();

    // Find the 'Review' button associated with the movie
    const reviewBtn = screen.getByRole("button", { name: "Review" });
    fireEvent.click(reviewBtn);

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

    // Select Rating (5 stars)
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

    // 6. Verify Dialog Closes (optional, usually handled by success side-effect)
    // Checking "Submit Review" is gone or dialog is gone might require waitFor
  });
});
