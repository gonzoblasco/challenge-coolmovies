import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewListDialog } from "./ReviewListDialog";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";

// Mock the generated hooks
jest.mock("../../../generated/graphql", () => ({
  useCurrentUserQuery: jest.fn(),
  useAllMoviesQuery: jest.fn(),
  useAllUsersQuery: jest.fn(),
  useMovieReviewsQuery: jest.fn(),
  useUpdateReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCreateReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCreateCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  api: {
    enhanceEndpoints: jest.fn(() => ({
      injectEndpoints: jest.fn(),
    })),
  },
}));

// Mock filtered list hooks
jest.mock("../hooks/useReviews", () => ({
  useReviews: jest.fn(),
}));

jest.mock("../../../state/enhancedApi", () => ({
  enhancedApi: {
    reducer: jest.fn(),
    reducerPath: "api",
    middleware: jest.fn(),
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

import { useReviews } from "../hooks/useReviews";

const mockReviews = {
  movieById: {
    __typename: "Movie",
    id: "1",
    title: "Cool Movie",
    movieReviewsByMovieId: {
      __typename: "MovieReviewsConnection",
      nodes: [
        {
          __typename: "MovieReview",
          id: "r1",
          title: "Great",
          body: "Loved it",
          rating: 5,
          userReviewerId: "user-1",
          movieId: "1",
          userByUserReviewerId: {
            __typename: "User",
            name: "Reviewer 1",
            id: "user-1",
          },
        },
      ],
    },
  },
};

describe("ReviewListDialog Component", () => {
  beforeEach(() => {
    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: { id: "user-1", name: "Reviewer 1" } },
      isLoading: false,
    });
    (graphqlHooks.useAllMoviesQuery as jest.Mock).mockReturnValue({
      data: { allMovies: { nodes: [{ id: "1", title: "Cool Movie" }] } },
      isLoading: false,
    });
    (graphqlHooks.useAllUsersQuery as jest.Mock).mockReturnValue({
      data: { allUsers: { nodes: [] } },
      isLoading: false,
    });
    (useReviews as jest.Mock).mockReturnValue({
      data: mockReviews,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return renderWithProviders(<ReviewListDialog />, {
      preloadedState: {
        reviews: {
          movies: [{ id: "1", title: "Cool Movie" }],
          selectedMovieId: "1",
          isViewReviewsOpen: true,
          isWriteReviewOpen: false,
          loading: false,
          error: undefined,
        },
      },
    });
  };

  it("renders reviews successfully", async () => {
    renderComponent();
    expect(await screen.findByText("Great")).toBeInTheDocument();
  });

  it("allows editing a review", async () => {
    const updateReviewMock = jest.fn();
    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
      updateReviewMock, // The mutation trigger function
      { isLoading: false }, // The mutation result object
    ]);

    renderComponent();

    // Find and click the edit button
    const editButton = await screen.findByRole("button", {
      name: /edit review/i,
    });
    fireEvent.click(editButton);

    // Change the title
    const titleInput = screen.getByPlaceholderText("Review Title");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    // Save
    const saveButton = screen.getByRole("button", { name: /save review/i });
    fireEvent.click(saveButton);

    // Verify mutation was called with correct args
    await waitFor(() => {
      expect(updateReviewMock).toHaveBeenCalledWith({
        id: "r1",
        patch: {
          title: "Updated Title",
          body: "Loved it", // Original body
          rating: 5, // Original rating
        },
      });
    });
  });
});
