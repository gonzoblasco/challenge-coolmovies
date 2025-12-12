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
    const updateReviewMock = jest.fn().mockResolvedValue({
      data: {
        updateMovieReviewById: {
          movieReview: {
            ...mockReview,
            title: "Updated Title",
            body: "Updated Body",
          },
        },
      },
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
        "Failed to update review"
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
        "Failed to delete review"
      );
    });
  });

  it("updates rating in edit mode", async () => {
    const updateReviewMock = jest.fn().mockResolvedValue({});
    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
      updateReviewMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <ReviewCard review={mockReview} currentUser={mockUser} />
    );

    fireEvent.click(screen.getByRole("button", { name: /Edit review/i }));

    // Click 5th star (rating 5)
    fireEvent.click(screen.getByRole("button", { name: "Rate 5 stars" }));

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

    // Re-open and submit
    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: mockUser },
      isLoading: false,
    });

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
});
