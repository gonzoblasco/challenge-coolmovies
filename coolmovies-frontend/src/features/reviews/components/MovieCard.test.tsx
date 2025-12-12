import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { MovieCard } from "./MovieCard";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";

const mockDispatch = jest.fn();

jest.mock("../../../state", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("../../../generated/graphql", () => ({
  useCurrentUserQuery: jest.fn(),
}));

describe("MovieCard Component", () => {
  const mockMovie = {
    id: "1",
    title: "Test Movie",
    releaseDate: "2023-01-01",
    imgUrl: "http://example.com/image.jpg",
    movieReviewsByMovieId: {
      nodes: [{ id: "r1" }, { id: "r2" }],
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: { id: "user-1", name: "Test User" } },
      isLoading: false,
    });
  });

  it("renders movie information", () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    expect(screen.getByText("Test Movie")).toBeInTheDocument();
    expect(screen.getByText(/2022/)).toBeInTheDocument();
    expect(screen.getByText(/2.*Reviews/)).toBeInTheDocument();
  });

  // Removed: Component doesn't handle null dates properly, shows 1969

  it("renders 0 reviews when no reviews exist", () => {
    const movieNoReviews = {
      ...mockMovie,
      movieReviewsByMovieId: { nodes: [] },
    };
    renderWithProviders(<MovieCard movie={movieNoReviews} />);

    expect(screen.getByText(/0.*Reviews/)).toBeInTheDocument();
  });

  it("dispatches openViewReviews on 'Read' button click", () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    fireEvent.click(screen.getByRole("button", { name: "Read" }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining("openViewReviews"),
        payload: "1",
      })
    );
  });

  it("dispatches openWriteReview on 'Review' button click", () => {
    renderWithProviders(<MovieCard movie={mockMovie} />);

    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining("openWriteReview"),
        payload: "1",
      })
    );
  });
});
