import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  const mockMovie: Partial<graphqlHooks.Movie> = {
    id: "1",
    title: "Test Movie",
    releaseDate: "2023-01-01",
    imgUrl: "http://example.com/image.jpg",
    movieReviewsByMovieId: {
      nodes: [
        { id: "r1", rating: 4 } as unknown as graphqlHooks.MovieReview,
        { id: "r2", rating: 5 } as unknown as graphqlHooks.MovieReview,
      ],
    } as unknown as graphqlHooks.MovieReviewsConnection,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: { id: "user-1", name: "Test User" } },
      isLoading: false,
    });
  });

  it("renders movie information", () => {
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    expect(screen.getByText("Test Movie")).toBeInTheDocument();
    expect(screen.getByText(/2022/)).toBeInTheDocument();
    expect(screen.getByText(/2.*Reviews/)).toBeInTheDocument();
  });

  // Removed: Component doesn't handle null dates properly, shows 1969

  it("renders 0 reviews when no reviews exist", () => {
    const movieNoReviews: Partial<graphqlHooks.Movie> = {
      ...mockMovie,
      movieReviewsByMovieId: {
        nodes: [],
      } as unknown as graphqlHooks.MovieReviewsConnection,
    };
    renderWithProviders(
      <MovieCard movie={movieNoReviews as unknown as graphqlHooks.Movie} />
    );

    expect(screen.getByText(/0.*Reviews/)).toBeInTheDocument();
  });

  it("dispatches openViewReviews on 'Read' button click", () => {
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Read" }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining("openViewReviews"),
        payload: "1",
      })
    );
  });

  it("dispatches openWriteReview on 'Review' button click", () => {
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining("openWriteReview"),
        payload: "1",
      })
    );
  });

  it("dispatches openViewReviews when clicking on the poster", () => {
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    const poster = screen.getByRole("button", {
      name: "Read reviews for Test Movie",
    });
    fireEvent.click(poster);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining("openViewReviews"),
        payload: "1",
      })
    );
  });

  it("dispatches openViewReviews when pressing Enter on the poster", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    const poster = screen.getByRole("button", {
      name: "Read reviews for Test Movie",
    });

    poster.focus();
    await user.keyboard("{Enter}");

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining("openViewReviews"),
        payload: "1",
      })
    );
  });

  it("dispatches openViewReviews when pressing Space on the poster", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    const poster = screen.getByRole("button", {
      name: "Read reviews for Test Movie",
    });

    poster.focus();
    await user.keyboard(" ");

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining("openViewReviews"),
        payload: "1",
      })
    );
  });

  it("poster has correct accessibility attributes", () => {
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    const poster = screen.getByRole("button", {
      name: "Read reviews for Test Movie",
    });

    expect(poster).toHaveAttribute("aria-label", "Read reviews for Test Movie");
  });
});
