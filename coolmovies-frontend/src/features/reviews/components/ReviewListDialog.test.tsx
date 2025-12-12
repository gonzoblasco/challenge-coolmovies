import React from "react";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ReviewListDialog } from "./ReviewListDialog";
import { renderWithProviders } from "../../../test-utils";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from "sonner";
import * as graphqlHooks from "../../../generated/graphql";

// Mock the generated hooks
jest.mock("../../../generated/graphql", () => ({
  useCurrentUserQuery: jest.fn(),
  useAllMoviesQuery: jest.fn(),
  useAllUsersQuery: jest.fn(),
  useMovieReviewsQuery: jest.fn(),
  useUpdateReviewMutation: jest.fn(() => [
    jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }), 
    { isLoading: false }
  ]),
  useCreateReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCreateCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  api: {
    enhanceEndpoints: jest.fn(() => ({
      injectEndpoints: jest.fn(),
    })),
    usePrefetch: jest.fn(() => jest.fn()),
  },
}));

// Mock filtered list hooks
jest.mock("../hooks/useReviews", () => ({
  useReviews: jest.fn(),
}));

jest.mock("../hooks/useReviewFilters", () => ({
  useReviewFilters: jest.fn(),
}));


const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPrefetch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
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
    
    // Default implementation for filters with state
    const useReviewFiltersMock = require("../hooks/useReviewFilters").useReviewFilters;
    useReviewFiltersMock.mockImplementation(() => {
      const [searchTerm, setSearchTerm] = React.useState("");
      const [ratingFilter, setRatingFilter] = React.useState<number | null>(null);
      const [userFilter, setUserFilter] = React.useState<string | null>(null);

      const updateFilter = (type: "rating" | "user", value: any) => {
        if (type === "rating") setRatingFilter(value);
        if (type === "user") setUserFilter(value);
      };

      const clearFilters = () => {
        setSearchTerm("");
        setRatingFilter(null);
        setUserFilter(null);
      };

      return {
        searchTerm,
        setSearchTerm,
        searchFilter: searchTerm,
        ratingFilter,
        userFilter,
        updateFilter,
        clearFilters,
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (isOpen = true) => {
    // Update mock for this specific render if needed, or rely on default
    const useSearchParamsMock = require("next/navigation").useSearchParams;
    if (isOpen) {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams("movieId=1&action=view-reviews")
      );
    } else {
      useSearchParamsMock.mockReturnValue(new URLSearchParams(""));
    }

    return renderWithProviders(<ReviewListDialog />);
  };

  it("renders reviews successfully", async () => {
    renderComponent();
    expect(await screen.findByText("Great")).toBeInTheDocument(); // Changed from "Great movie!" to "Great" to match mockReviews.title
  });

  // Unskipped and using fake timers as requested
  it("allows editing a review", async () => {
    const updateReviewMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    
    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockImplementation(() => [
      updateReviewMock, // The mutation trigger function
      { isLoading: false }, // The mutation result object
    ]);

    renderComponent();

    // Find and click edit
    const editButton = (await screen.findAllByRole("button", { name: /edit review/i }))[0];
    fireEvent.click(editButton);

    const input = screen.getByDisplayValue("Loved it"); // Kept "Loved it" to target the body
    fireEvent.change(input, { target: { value: "Updated Review Content" } });
    
    // Save
    const saveButton = await screen.findByRole("button", { name: /save review/i });
    fireEvent.click(saveButton);



    await waitFor(() => {
      const calls = updateReviewMock.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const args = calls[0][0];
      expect(args.id).toBe("r1");
      expect(args.patch).toEqual(expect.objectContaining({
        title: "Great",
        body: "Updated Review Content",
        rating: 5,
      }));
    });

    expect(toast.success).toHaveBeenCalledWith("Review updated successfully");
  });

  describe("Filter interactions", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("updates filters and refreshes reviews", async () => {
      (graphqlHooks.useAllUsersQuery as jest.Mock).mockReturnValue({
        data: {
          allUsers: {
            nodes: [{ id: "user-1", name: "Reviewer 1" }],
          },
        },
      });

      renderComponent();

      // 1. Search
      fireEvent.change(
        screen.getByPlaceholderText("Search reviews by title or body..."),
        { target: { value: "Great" } }
      );

      // Fast-forward timers to trigger any debounce
      act(() => {
        jest.runAllTimers();
      });

      // 2. Rating Filter
      fireEvent.click(screen.getByText("All Ratings"));
      fireEvent.click(screen.getByText("5 Stars"));

      // 3. User Filter
      fireEvent.click(screen.getByText("All Users"));
      fireEvent.click(screen.getByText("Reviewer 1"));

      await waitFor(() => {
        expect(useReviews).toHaveBeenLastCalledWith(
          "1",
          expect.objectContaining({
            and: expect.arrayContaining([
              expect.objectContaining({
                or: expect.arrayContaining([
                  expect.objectContaining({ title: { includesInsensitive: "Great" } }),
                  expect.objectContaining({ body: { includesInsensitive: "Great" } }),
                ])
              }),
              expect.objectContaining({ rating: { equalTo: 5 } }),
              expect.objectContaining({ userReviewerId: { equalTo: "user-1" } }),
            ])
          })
        );
      });

      // 4. Clear Filters
      const clearBtn = screen.getByText("Clear Filters");
      fireEvent.click(clearBtn);
      
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(useReviews).toHaveBeenLastCalledWith("1", undefined);
      });
    });
  });

  it("navigates to write review", () => {
    renderComponent();

    const writeBtn = screen.getByRole("button", { name: "Write a Review" });
    fireEvent.click(writeBtn);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("action=write-review"),
      expect.anything()
    );
  });

  it("shows empty state when no reviews match filters", async () => {
    (useReviews as jest.Mock).mockReturnValue({
      data: { movieById: { movieReviewsByMovieId: { nodes: [] } } },
      isLoading: false,
    });

    renderComponent();

    // Simulate active filter
    fireEvent.change(
      screen.getByPlaceholderText("Search reviews by title or body..."),
      {
        target: { value: "Impossible" },
      }
    );

    expect(await screen.findByText("No reviews match your filters.")).toBeInTheDocument();
    expect(screen.getByText("Clear filters and view all")).toBeInTheDocument();
  });
});
