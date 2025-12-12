import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateReviewDialog } from "./CreateReviewDialog";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";
import { useCreateReview } from "../hooks/useCreateReview";

// Mocks
jest.mock("../../../generated/graphql", () => ({
  useCurrentUserQuery: jest.fn(),
  useAllMoviesQuery: jest.fn(),
}));

jest.mock("../hooks/useCreateReview", () => ({
  useCreateReview: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key) => {
      if (key === "movieId") return "1";
      if (key === "action") return "write-review";
      return null;
    }),
    toString: jest.fn(() => "movieId=1&action=write-review"),
  })),
  usePathname: jest.fn(() => "/movies"),
}));

const mockUser = { id: "user-1", name: "Test User" };
const mockMovies = [
  { id: "1", title: "Cool Movie" },
];

describe("CreateReviewDialog Component", () => {
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
    (useCreateReview as jest.Mock).mockReturnValue([
      jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) }),
      { isLoading: false },
    ]);
  });

  it("renders dialog when open", () => {
    renderWithProviders(<CreateReviewDialog />);
    expect(screen.getByText("Write a Review for Cool Movie")).toBeInTheDocument();
  });

  it("handles successful submission", async () => {
    const createReviewMock = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({})
    });
    (useCreateReview as jest.Mock).mockReturnValue([createReviewMock, { isLoading: false }]);

    renderWithProviders(<CreateReviewDialog />);

    // Fill form
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "My Review" } });
    fireEvent.change(screen.getByLabelText("Review"), { target: { value: "It was good." } });
    
    // Rating
    const rate5 = screen.getByLabelText("Rate 5 stars");
    fireEvent.click(rate5);

    // Submit
    fireEvent.click(screen.getByRole("button", { name: "Submit Review" }));

    await waitFor(() => {
        expect(createReviewMock).toHaveBeenCalledWith({
            title: "My Review",
            body: "It was good.",
            rating: 5,
            movieId: "1",
            userId: "user-1"
        });
        expect(require("sonner").toast.success).toHaveBeenCalled();
    });
  });

  it("handles submission error", async () => {
    const createReviewMock = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error("Failed"))
    });
    (useCreateReview as jest.Mock).mockReturnValue([createReviewMock, { isLoading: false }]);

    renderWithProviders(<CreateReviewDialog />);

    // Fill form
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "My Review" } });
    fireEvent.change(screen.getByLabelText("Review"), { target: { value: "It was good." } });
    fireEvent.click(screen.getByLabelText("Rate 5 stars"));

    // Submit
    fireEvent.click(screen.getByRole("button", { name: "Submit Review" }));

    await waitFor(() => {
        expect(require("sonner").toast.error).toHaveBeenCalledWith("Failed to publish review", expect.objectContaining({ action: expect.any(Object) }));
    });
  });

  it("handles hover rating state", () => {
    renderWithProviders(<CreateReviewDialog />);
    
    const rate3Button = screen.getByLabelText("Rate 3 stars");
    const rate5Button = screen.getByLabelText("Rate 5 stars");
    
    // Initially, no rating selected - all stars should have muted color
    const allStars = screen.getAllByLabelText(/Rate \d stars?/);
    allStars.forEach(button => {
      const star = button.querySelector('svg');
      expect(star).toHaveClass('text-muted-foreground/30');
      expect(star).not.toHaveClass('fill-yellow-400');
    });
    
    // Hover over the 3rd star - first 3 stars should be highlighted
    fireEvent.mouseEnter(rate3Button);
    
    const star1 = screen.getByLabelText("Rate 1 stars").querySelector('svg');
    const star2 = screen.getByLabelText("Rate 2 stars").querySelector('svg');
    const star3 = screen.getByLabelText("Rate 3 stars").querySelector('svg');
    const star4 = screen.getByLabelText("Rate 4 stars").querySelector('svg');
    const star5 = screen.getByLabelText("Rate 5 stars").querySelector('svg');
    
    expect(star1).toHaveClass('fill-yellow-400');
    expect(star1).toHaveClass('text-yellow-400');
    expect(star2).toHaveClass('fill-yellow-400');
    expect(star2).toHaveClass('text-yellow-400');
    expect(star3).toHaveClass('fill-yellow-400');
    expect(star3).toHaveClass('text-yellow-400');
    
    // Stars 4 and 5 should remain unhighlighted
    expect(star4).toHaveClass('text-muted-foreground/30');
    expect(star4).not.toHaveClass('fill-yellow-400');
    expect(star5).toHaveClass('text-muted-foreground/30');
    expect(star5).not.toHaveClass('fill-yellow-400');
    
    // Mouse leave - all stars should revert to muted
    fireEvent.mouseLeave(rate3Button);
    
    allStars.forEach(button => {
      const star = button.querySelector('svg');
      expect(star).toHaveClass('text-muted-foreground/30');
      expect(star).not.toHaveClass('fill-yellow-400');
    });
    
    // Now click to set a rating, then hover over a different star
    fireEvent.click(rate3Button);
    
    // Hover over 5th star - all 5 should be highlighted
    fireEvent.mouseEnter(rate5Button);
    
    allStars.forEach(button => {
      const star = button.querySelector('svg');
      expect(star).toHaveClass('fill-yellow-400');
      expect(star).toHaveClass('text-yellow-400');
    });
    
    // Mouse leave - should revert to the clicked rating (3 stars)
    fireEvent.mouseLeave(rate5Button);
    
    expect(star1).toHaveClass('fill-yellow-400');
    expect(star2).toHaveClass('fill-yellow-400');
    expect(star3).toHaveClass('fill-yellow-400');
    expect(star4).not.toHaveClass('fill-yellow-400');
    expect(star5).not.toHaveClass('fill-yellow-400');
  });
});
