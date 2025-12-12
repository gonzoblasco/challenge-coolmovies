import React, { FC, memo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDeleteCommentMutation,
  CurrentUserQuery,
} from "../../../generated/graphql";
import { TEXT } from "@/constants/text";
import { errorService } from "@/services/errorService";
import { toast } from "sonner";

interface Comment {
  id: string;
  userId: string;
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

export const CommentList: FC<CommentListProps> = memo(({
  comments,
  currentUser,
}) => {
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const [commentToDelete, setCommentToDelete] = React.useState<string | null>(
    null
  );

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    try {
      await deleteComment({ id: commentToDelete }).unwrap();
      setCommentToDelete(null);
    } catch (error) {
      errorService.log(error, "CommentList.confirmDelete");
      const message = errorService.getUserFriendlyMessage(error);
      toast.error(`Failed to delete comment: ${message}`);
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
        const isOwner = currentUser && comment.userId === currentUser.id;

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
                  onClick={() => setCommentToDelete(comment.id)}
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
      <AlertDialog
        open={!!commentToDelete}
        onOpenChange={(open) => !open && setCommentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {TEXT.DELETE_CONFIRMATION_TITLE}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {TEXT.DELETE_COMMENT_CONFIRMATION_DESC}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{TEXT.CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : TEXT.DELETE}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

CommentList.displayName = "CommentList";
