import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewCard } from "./ReviewCard";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";
import { TEXT } from "@/constants/text";

jest.mock("../../../generated/graphql", () => ({
  useUpdateReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteReviewMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCreateCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useCurrentUserQuery: jest.fn(), // If CommentForm uses it
  NewCommentFragmentDoc: {},
}));

describe("ReviewCard Component", () => {
  const mockUser = { id: "user-1", name: "Test User" } as any;
  const mockReview = {
    id: "r1",
    title: "Review Title",
    body: "Review Body",
    rating: 4,
    userReviewerId: "user-1",
    userByUserReviewerId: { name: "Test User" },
    commentsByMovieReviewId: {
      nodes: [
        {
          id: "c1",
          body: "Comment 1",
          userByUserId: { name: "Commenter 1" },
          userId: "user-2",
        },
      ],
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
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
      unwrap: jest.fn().mockResolvedValue({}), // RTK Query standard
    });
    // However, useUpdateReviewMutation in component does NOT use unwrap() in catch block?
    // Let's check code:
    // await updateReview({...}); -> returns promise with { data } or { error }
    // Actually typically RTK mutation returns { unwrap: ... }.
    // Detailed check: component code says: `await updateReview({...})` without .unwrap().
    // So mocking the return value of the function is enough.

    (graphqlHooks.useUpdateReviewMutation as jest.Mock).mockReturnValue([
      updateReviewMock, // Function
      { isLoading: false }, // result object
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
});
