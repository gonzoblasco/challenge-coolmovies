import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewCard } from "./ReviewCard";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";
import { TEXT } from "@/constants/text";
import { Review } from "../types";

jest.mock("../../../generated/graphql", () => ({
  useUpdateReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCreateCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCurrentUserQuery: jest.fn().mockImplementation(() => ({
    data: undefined,
    isLoading: false,
    error: undefined,
  })),
  NewCommentFragmentDoc: {},
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ReviewCard Component", () => {
  // Extract the User type from CurrentUserQuery
  type User = NonNullable<graphqlHooks.CurrentUserQuery["currentUser"]>;

  const mockUser: User = {
    id: "user-1",
    name: "Test User",
    __typename: "User",
  };

  const mockReview = {
    id: "r1",
    title: "Review Title",
    body: "Review Body",
    rating: 4,
    userReviewerId: "user-1",
    userByUserReviewerId: {
      id: "user-1",
      name: "Test User",
      __typename: "User" as const,
    },
    commentsByMovieReviewId: {
      nodes: [
        {
          id: "c1",
          body: "Comment 1",
          userByUserId: {
            id: "user-2",
            name: "Commenter 1",
            __typename: "User" as const,
          },
          userId: "user-2",
        },
      ],
    },
  } as Review;

  beforeEach(() => {
    jest.clearAllMocks();
    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockImplementation(() => ({
      data: { currentUser: mockUser },
      isLoading: false,
    }));
  });



  it("renders review details", () => {
    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );
    expect(screen.getByText("Review Title")).toBeInTheDocument();
    expect(screen.getByText("Review Body")).toBeInTheDocument();
    expect(screen.getByText("— Test User")).toBeInTheDocument();
  });

  it("toggles comment visibility", () => {
    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    // Initial state: hidden
    expect(screen.queryByText("Comment 1")).not.toBeInTheDocument();
    const toggleBtn = screen.getByText(/Show Comments/);

    // Show
    fireEvent.click(toggleBtn);
    expect(screen.getByText("Comment 1")).toBeInTheDocument();
    expect(screen.getByText(/Hide Comments/)).toBeInTheDocument();

    // Hide
    fireEvent.click(screen.getByText(/Hide Comments/));
    expect(screen.queryByText("Comment 1")).not.toBeInTheDocument();
  });

  it("deletes review flow", async () => {
    const deleteReviewMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    (graphqlHooks.useDeleteReviewMutation as jest.Mock).mockReturnValue([
      deleteReviewMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    // Click delete
    fireEvent.click(screen.getByRole("button", { name: "Delete review" }));

    // Confirm dialog
    expect(
      await screen.findByText(TEXT.DELETE_CONFIRMATION_TITLE)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: TEXT.DELETE }));

    await waitFor(() => {
      expect(deleteReviewMock).toHaveBeenCalledWith({ id: "r1" });
    });
  });

  it("edits review flow", async () => {
    const updateReviewMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        data: {
          updateMovieReviewById: {
            movieReview: {
              ...mockReview,
              title: "Updated Title",
              body: "Updated Body",
            },
          },
        },
      }),
    });
    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
      updateReviewMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    // Click edit
    fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

    // Change value
    fireEvent.change(screen.getByDisplayValue("Review Title"), {
      target: { value: "New Title" },
    });
    fireEvent.change(screen.getByDisplayValue("Review Body"), {
      target: { value: "New Body" },
    });

    // Save
    fireEvent.click(screen.getByRole("button", { name: "Save review" }));

    await waitFor(() => {
      expect(updateReviewMock).toHaveBeenCalledWith({
        id: mockReview.id,
        patch: {
          title: "New Title",
          body: "New Body",
          rating: 4,
        },
      });
    });
  });
  it("shows loading state when deleting", () => {
    (graphqlHooks.useDeleteReviewMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isLoading: true },
    ]);

    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    // Open delete dialog
    fireEvent.click(screen.getByRole("button", { name: "Delete review" }));

    const deleteBtn = screen.getByRole("button", { name: "Deleting..." });
    expect(deleteBtn).toBeDisabled();
  });

  it("shows loading state when editing", () => {
    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isLoading: true },
    ]);

    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

    const saveBtn = screen.getByRole("button", { name: "Save review" });
    expect(saveBtn).toBeDisabled();
    // Check if the spinner is present (which implies loading state logic was hit)
    expect(saveBtn.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("cancels edit mode", () => {
    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

    const titleInput = screen.getByDisplayValue("Review Title");
    fireEvent.change(titleInput, { target: { value: "Changed" } });

    fireEvent.click(screen.getByRole("button", { name: "Cancel edit" }));

    expect(screen.getByText("Review Title")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Changed")).not.toBeInTheDocument();
  });

  it("handles update error", async () => {
    const updateReviewMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error("Failed")),
    });
    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
      updateReviewMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));
    fireEvent.click(screen.getByRole("button", { name: "Save review" }));

    await waitFor(() => {
      expect(require("sonner").toast.error).toHaveBeenCalledWith(
        "Failed to update review: Failed",
        expect.objectContaining({ action: expect.any(Object) })
      );
    });
  });

  it("handles delete error", async () => {
    const deleteReviewMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error("Failed")),
    });
    (graphqlHooks.useDeleteReviewMutation as jest.Mock).mockReturnValue([
      deleteReviewMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete review" }));
    fireEvent.click(screen.getByRole("button", { name: TEXT.DELETE })); // Confirm

    await waitFor(() => {
      expect(require("sonner").toast.error).toHaveBeenCalledWith(
        "Failed to delete review: Failed",
        expect.objectContaining({ action: expect.any(Object) })
      );
    });
  });

  it("updates rating in edit mode", async () => {
    const updateReviewMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
      updateReviewMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

    // Click 5th star (rating 5)
    fireEvent.click(screen.getByRole("radio", { name: "Rate 5 stars" }));

    fireEvent.click(screen.getByRole("button", { name: "Save review" }));

    await waitFor(() => {
      expect(updateReviewMock).toHaveBeenCalledWith(
        expect.objectContaining({
          patch: expect.objectContaining({ rating: 5 }),
        })
      );
    });
  });

  it("handles reply flow interactions", async () => {
    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    // Open reply
    fireEvent.click(screen.getAllByRole("button", { name: "Reply" })[0]);
    expect(
      screen.getByPlaceholderText("Write a comment...")
    ).toBeInTheDocument();

    // Cancel reply
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByPlaceholderText("Write a comment...")
    ).not.toBeInTheDocument();


    fireEvent.click(screen.getAllByRole("button", { name: "Reply" })[0]);

    const createCommentMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });

    (graphqlHooks.useCreateCommentMutation as jest.Mock).mockReturnValue([
      createCommentMock,
      { isLoading: false },
    ]);

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "New Comment" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Reply" })[1]);

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Write a comment...")
      ).not.toBeInTheDocument();
      // Comments list should be shown
      expect(screen.getByText("Comment 1")).toBeInTheDocument();
    });
  });

  describe("Keyboard navigation for star rating", () => {
    it("changes rating with arrow keys", async () => {
      const updateReviewMock = jest.fn().mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({}),
      });
      (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
        updateReviewMock,
        { isLoading: false },
      ]);

      renderWithProviders(
        <ReviewCard review={mockReview} currentUser={mockUser} />
      );

      // Enter edit mode
      fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

      // Get the radiogroup container
      const radiogroup = screen.getByRole("radiogroup", { name: "Rating" });

      // ArrowRight should increase rating
      fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
      
      // Verify 5 stars is now checked
      expect(screen.getByRole("radio", { name: "Rate 5 stars" })).toHaveAttribute("aria-checked", "true");
      
      // ArrowLeft should decrease rating  
      fireEvent.keyDown(radiogroup, { key: "ArrowLeft" });
      expect(screen.getByRole("radio", { name: "Rate 4 stars" })).toHaveAttribute("aria-checked", "true");

      // ArrowUp should increase rating
      fireEvent.keyDown(radiogroup, { key: "ArrowUp" });
      expect(screen.getByRole("radio", { name: "Rate 5 stars" })).toHaveAttribute("aria-checked", "true");

      // ArrowDown should decrease rating
      fireEvent.keyDown(radiogroup, { key: "ArrowDown" });
      expect(screen.getByRole("radio", { name: "Rate 4 stars" })).toHaveAttribute("aria-checked", "true");
    });

    it("changes rating with number keys 1-5", async () => {
      renderWithProviders(
        <ReviewCard review={mockReview} currentUser={mockUser} />
      );

      fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

      const radiogroup = screen.getByRole("radiogroup", { name: "Rating" });

      // Press number 1
      fireEvent.keyDown(radiogroup, { key: "1" });
      expect(screen.getByRole("radio", { name: "Rate 1 star" })).toHaveAttribute("aria-checked", "true");

      // Press number 5
      fireEvent.keyDown(radiogroup, { key: "5" });
      expect(screen.getByRole("radio", { name: "Rate 5 stars" })).toHaveAttribute("aria-checked", "true");

      // Press number 3
      fireEvent.keyDown(radiogroup, { key: "3" });
      expect(screen.getByRole("radio", { name: "Rate 3 stars" })).toHaveAttribute("aria-checked", "true");
    });

    it("respects rating bounds (1-5)", async () => {
      const lowRatingReview = { ...mockReview, rating: 1 };
      renderWithProviders(
        <ReviewCard review={lowRatingReview} currentUser={mockUser} />
      );

      fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

      const radiogroup = screen.getByRole("radiogroup", { name: "Rating" });

      // Try to go below 1
      fireEvent.keyDown(radiogroup, { key: "ArrowLeft" });
      expect(screen.getByRole("radio", { name: "Rate 1 star" })).toHaveAttribute("aria-checked", "true");
    });

    it("selects rating with Enter/Space on star button", async () => {
      renderWithProviders(
        <ReviewCard review={mockReview} currentUser={mockUser} />
      );

      fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

      const star3 = screen.getByRole("radio", { name: "Rate 3 stars" });

      // Enter key should select the star
      fireEvent.keyDown(star3, { key: "Enter" });
      expect(star3).toHaveAttribute("aria-checked", "true");

      // Space key should also select
      const star2 = screen.getByRole("radio", { name: "Rate 2 stars" });
      fireEvent.keyDown(star2, { key: " " });
      expect(star2).toHaveAttribute("aria-checked", "true");
    });

    it("handles max rating bound", async () => {
      const highRatingReview = { ...mockReview, rating: 5 };
      renderWithProviders(
        <ReviewCard review={highRatingReview} currentUser={mockUser} />
      );

      fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

      const radiogroup = screen.getByRole("radiogroup", { name: "Rating" });

      // Try to go above 5
      fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
      expect(screen.getByRole("radio", { name: "Rate 5 stars" })).toHaveAttribute("aria-checked", "true");
    });
  });

  it("renders without comments button when no comments exist", () => {
    const reviewWithNoComments = {
      ...mockReview,
      commentsByMovieReviewId: { nodes: [] },
    };
    renderWithProviders(
      <ReviewCard review={reviewWithNoComments} currentUser={mockUser} />
    );
    
    expect(screen.queryByText(/Show Comments/)).not.toBeInTheDocument();
  });

  it("renders Anonymous when reviewer name is missing", () => {
    const reviewWithoutName = {
      ...mockReview,
      userByUserReviewerId: null,
    } as unknown as Review;
    
    renderWithProviders(
      <ReviewCard review={reviewWithoutName} currentUser={mockUser} />
    );
    
    expect(screen.getByText("— Anonymous")).toBeInTheDocument();
  });

  it("does not show edit/delete buttons when user is not owner", () => {
    const otherUser = { ...mockUser, id: "other-user" };
    
    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={otherUser} />
    );
    
    expect(screen.queryByRole("button", { name: /Edit review/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete review" })).not.toBeInTheDocument();
  });
});
