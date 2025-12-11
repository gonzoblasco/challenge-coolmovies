import React, { FC } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import {
  useDeleteCommentMutation,
  CurrentUserQuery,
} from "../../../generated/graphql";

interface Comment {
  id: string;
  title?: string | null;
  body?: string | null;
  userByUserId?: {
    id: string;
    name: string;
  } | null;
}

interface CommentListProps {
  comments: (Comment | null)[];
  currentUser: CurrentUserQuery["currentUser"] | null | undefined;
}

export const CommentList: FC<CommentListProps> = ({
  comments,
  currentUser,
}) => {
  const [deleteComment] = useDeleteCommentMutation();

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment({ id: commentId }).unwrap();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pl-4 border-l-2 border-muted space-y-3">
      <h5 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <MessageSquare className="w-3 h-3" />
        Comments
      </h5>
      {comments.map((comment) => {
        if (!comment) return null;
        const isOwner =
          currentUser && comment.userByUserId?.id === currentUser.id;

        return (
          <div
            key={comment.id}
            className="bg-background/50 rounded-md p-3 text-sm"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-xs">
                {comment.userByUserId?.name || "Anonymous"}
              </span>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(comment.id)}
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
            {comment.title && (
              <div className="font-medium text-xs mb-1">{comment.title}</div>
            )}
            <div className="text-foreground/80">{comment.body}</div>
          </div>
        );
      })}
    </div>
  );
};
