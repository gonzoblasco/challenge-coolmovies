import React from "react";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";
import { CommentList } from "./CommentList";
import { renderWithProviders } from "../../../test-utils";
import * as graphqlHooks from "../../../generated/graphql";
import { TEXT } from "@/constants/text";

// Mock hooks
jest.mock("../../../generated/graphql", () => ({
  useDeleteCommentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock("../../../services/errorService", () => ({
  errorService: {
    log: jest.fn(),
    getUserFriendlyMessage: jest.fn(() => "mock error message"),
  },
}));

import { errorService } from "../../../services/errorService";

describe("CommentList Component", () => {
  // Extract the User type from CurrentUserQuery
  type User = NonNullable<graphqlHooks.CurrentUserQuery["currentUser"]>;

  const mockUser: User = {
    id: "user-1",
    name: "Test User",
    __typename: "User",
  };
  const otherUser: User = {
    id: "user-2",
    name: "Other User",
    __typename: "User",
  };

  const mockComments = [
    {
      id: "c1",
      userId: "user-1",
      title: "My Comment",
      body: "Body 1",
      userByUserId: { id: "user-1", name: "Test User" },
    },
    {
      id: "c2",
      userId: "user-2",
      title: "Other Comment",
      body: "Body 2",
      userByUserId: { id: "user-2", name: "Other User" },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing if comments are empty", () => {
    const { container } = renderWithProviders(
      <CommentList comments={[]} currentUser={mockUser} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders comments", () => {
    renderWithProviders(
      <CommentList comments={mockComments} currentUser={mockUser} />
    );

    expect(screen.getByText("My Comment")).toBeInTheDocument();
    expect(screen.getByText("Body 1")).toBeInTheDocument();
    expect(screen.getByText("Other Comment")).toBeInTheDocument();
    expect(screen.getByText("Body 2")).toBeInTheDocument();
  });

  it("shows delete button only for own comments", () => {
    renderWithProviders(
      <CommentList comments={mockComments} currentUser={mockUser} />
    );

    // Finding delete button within the user's comment card
    // We can assume the first delete button corresponds to the first comment which is owned by user-1
    const deleteButtons = screen.queryAllByRole("button", {
      name: "Delete comment",
    });
    expect(deleteButtons).toHaveLength(1);
  });

  it("opens delete confirmation and deletes comment", async () => {
    const deleteCommentMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    (graphqlHooks.useDeleteCommentMutation as jest.Mock).mockReturnValue([
      deleteCommentMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <CommentList comments={mockComments} currentUser={mockUser} />
    );

    // Click delete
    fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));

    // Check dialog
    expect(
      await screen.findByText(TEXT.DELETE_CONFIRMATION_TITLE)
    ).toBeInTheDocument();
    expect(
      screen.getByText(TEXT.DELETE_COMMENT_CONFIRMATION_DESC)
    ).toBeInTheDocument();

    // Confirm
    fireEvent.click(screen.getByRole("button", { name: TEXT.DELETE }));

    await waitFor(() => {
      expect(deleteCommentMock).toHaveBeenCalledWith({ id: "c1" });
    });
  });

  it("handles delete error gracefully", async () => {
    const deleteCommentMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(new Error("Failed")),
    });
    (graphqlHooks.useDeleteCommentMutation as jest.Mock).mockReturnValue([
      deleteCommentMock,
      { isLoading: false },
    ]);

    renderWithProviders(
      <CommentList comments={mockComments} currentUser={mockUser} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete comment" }));
    fireEvent.click(screen.getByRole("button", { name: TEXT.DELETE }));

    await waitFor(() => {
      expect(deleteCommentMock).toHaveBeenCalled();
      expect(errorService.log).toHaveBeenCalledWith(
        expect.any(Error),
        "CommentList.confirmDelete"
      );
    });
  });
});
