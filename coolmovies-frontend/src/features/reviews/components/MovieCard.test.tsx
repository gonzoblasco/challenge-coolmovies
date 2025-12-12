import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovieCard } from "./MovieCard";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/movies",
  useSearchParams: () => mockSearchParams,
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

  it("renders 'N/A' when release date is invalid", () => {
    const movieInvalidDate: Partial<graphqlHooks.Movie> = {
      ...mockMovie,
      releaseDate: "invalid-date-string",
    };
    renderWithProviders(
      <MovieCard movie={movieInvalidDate as unknown as graphqlHooks.Movie} />
    );

    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

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

  it("updates URL to view reviews on 'Read' button click", () => {
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Read" }));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("action=view-reviews"),
      expect.anything()
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("movieId=1"),
      expect.anything()
    );
  });

  it("updates URL to write review on 'Review' button click", () => {
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Review" }));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("action=write-review"),
      expect.anything()
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("movieId=1"),
      expect.anything()
    );
  });

  it("updates URL to view reviews when clicking on the poster", () => {
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    const poster = screen.getByRole("button", {
      name: "View reviews for Test Movie",
    });
    fireEvent.click(poster);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("action=view-reviews"),
      expect.anything()
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("movieId=1"),
      expect.anything()
    );
  });

  it("updates URL to view reviews when pressing Enter on the poster", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    const poster = screen.getByRole("button", {
      name: "View reviews for Test Movie",
    });

    poster.focus();
    await user.keyboard("{Enter}");

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("action=view-reviews"),
      expect.anything()
    );
  });

  it("updates URL to view reviews when pressing Space on the poster", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MovieCard movie={mockMovie as unknown as graphqlHooks.Movie} />
    );

    const poster = screen.getByRole("button", {
      name: "View reviews for Test Movie",
    });

    poster.focus();
    await user.keyboard(" ");

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("action=view-reviews"),
      expect.anything()
    );
  });
  it("renders with default fallback when imgUrl is null", () => {
    const movieNoImage: Partial<graphqlHooks.Movie> = {
      ...mockMovie,
      imgUrl: null as any,
    };
    renderWithProviders(
      <MovieCard movie={movieNoImage as unknown as graphqlHooks.Movie} />
    );

    // Should not crash, and might render an image placeholder or just the title container
    expect(screen.getByText("Test Movie")).toBeInTheDocument();
  });

  it("renders correctly with a very long title", () => {
    const longTitle = "A".repeat(200);
    const movieLongTitle: Partial<graphqlHooks.Movie> = {
      ...mockMovie,
      title: longTitle,
    };
    renderWithProviders(
      <MovieCard movie={movieLongTitle as unknown as graphqlHooks.Movie} />
    );

    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });
});
