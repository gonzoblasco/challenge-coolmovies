import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import Reviews from "./Reviews";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";

// Mock the generated hooks
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
    usePrefetch: jest.fn(() => jest.fn()),
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
    title: "Cool Movie",
    releaseDate: "2023-01-01",
    imgUrl: "http://example.com/image.jpg",
    nodeId: "node-1",
    movieDirectorId: "director-1",
    userCreatorId: "user-creator-1",
    movieReviewsByMovieId: {
      nodes: [],
      edges: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      totalCount: 0,
    },
  },
];

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
      edges: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
      totalCount: 1,
    },
  },
};

describe("Reviews Component", () => {
  beforeEach(() => {
    // Default mocks
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
    (graphqlHooks.useMovieReviewsQuery as jest.Mock).mockReturnValue({
      data: mockReviews,
      isLoading: false,
    });
    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isLoading: false },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading skeletons initially", async () => {
    (graphqlHooks.useAllMoviesQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithProviders(<Reviews />);

    expect(screen.queryByText("Cool Movie")).not.toBeInTheDocument();
  });

  it("renders movies after loading", async () => {
    renderWithProviders(<Reviews />);

    // The component fetches movies via useAllMoviesQuery (mocked) and renders MovieCard
    expect(await screen.findByText("Cool Movie")).toBeInTheDocument();
  });

  it("opens view reviews dialog when requested", async () => {
    // Mock the URL params to simulate open dialog
    const useSearchParamsMock = require("next/navigation").useSearchParams;
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("movieId=1&action=view-reviews")
    );

    renderWithProviders(<Reviews />);

    // The dialog should be open and showing the review (from mocked useMovieReviewsQuery)
    expect(await screen.findByText("Great")).toBeInTheDocument();
    expect(screen.getByText("Loved it")).toBeInTheDocument();
  });

  it("allows editing a review", async () => {
    // Mock the URL params to simulate open dialog
    const useSearchParamsMock = require("next/navigation").useSearchParams;
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("movieId=1&action=view-reviews")
    );

    const updateMock = jest.fn().mockResolvedValue({
      data: {
        updateMovieReviewById: {
          movieReview: {
            id: "r1",
            title: "Updated Title",
            body: "Updated Body",
            rating: 5,
          },
        },
      },
    });

    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
      updateMock,
      { isLoading: false },
    ]);

    renderWithProviders(<Reviews />);

    // Verify initial state
    expect(await screen.findByText("Great")).toBeInTheDocument();

    // Click edit
    const editBtn = await screen.findByRole("button", { name: /edit review/i });
    fireEvent.click(editBtn);

    // Change inputs
    const titleInput = screen.getByPlaceholderText("Review Title");
    const bodyInput = screen.getByPlaceholderText("Write your review here...");

    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    fireEvent.change(bodyInput, { target: { value: "Updated Body" } });

    // Click save
    const saveBtn = screen.getByRole("button", { name: "Save review" });
    fireEvent.click(saveBtn);

    // Verify mutation was called
    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith({
        id: "r1",
        patch: {
          title: "Updated Title",
          body: "Updated Body",
          rating: 5,
        },
      });
    });
  });

  it("matches snapshot", () => {
    const { container } = renderWithProviders(<Reviews />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
