import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { CommentForm } from "./CommentForm";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";

// Mock hooks
jest.mock("../../../generated/graphql", () => ({
  useCurrentUserQuery: jest.fn(),
  useCreateCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  NewCommentFragmentDoc: {},
}));

describe("CommentForm Component", () => {
  const mockOnCancel = jest.fn();
  const mockOnSuccess = jest.fn();
  const reviewId = "review-1";
  const mockUser = { id: "user-1", name: "Test User" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login message when not logged in", () => {
    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: null },
      isLoading: false,
    });

    renderWithProviders(
      <CommentForm
        reviewId={reviewId}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Please login to comment.")).toBeInTheDocument();
  });

  it("renders form when logged in", () => {
    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: mockUser },
      isLoading: false,
    });

    renderWithProviders(
      <CommentForm
        reviewId={reviewId}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByPlaceholderText("Title (optional)")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write a comment...")
    ).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    const createCommentMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });

    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: mockUser },
      isLoading: false,
    });

    (graphqlHooks.useCreateCommentMutation as jest.Mock).mockReturnValue([
      createCommentMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <CommentForm
        reviewId={reviewId}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Title (optional)"), {
      target: { value: "My Title" },
    });
    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "My Comment" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Reply" }));

    await waitFor(() => {
      expect(createCommentMock).toHaveBeenCalledWith({
        title: "My Title",
        body: "My Comment",
        reviewId: reviewId,
        userId: mockUser.id,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("displays error on failure", async () => {
    const createCommentMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error("Failed")),
    });

    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: mockUser },
      isLoading: false,
    });
    (graphqlHooks.useCreateCommentMutation as jest.Mock).mockReturnValue([
      createCommentMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <CommentForm
        reviewId={reviewId}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "My Comment" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));

    expect(
      await screen.findByText("Failed to post comment. Please try again.")
    ).toBeInTheDocument();
  });

  it("disables submit button when body is empty", () => {
    (graphqlHooks.useCurrentUserQuery as jest.Mock).mockReturnValue({
      data: { currentUser: mockUser },
      isLoading: false,
    });

    renderWithProviders(
      <CommentForm
        reviewId={reviewId}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
      />
    );

    const submitBtn = screen.getByRole("button", { name: "Reply" });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "   " },
    });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "hi" },
    });
    expect(submitBtn).not.toBeDisabled();
  });
});
