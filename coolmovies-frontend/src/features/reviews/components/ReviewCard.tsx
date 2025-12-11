import React, { FC, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Star, Pencil, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  CurrentUserQuery,
} from "../../../generated/graphql";
import { TEXT } from "@/constants/text";
import { Review } from "../types";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";

interface ReviewCardProps {
  review: Review;
  currentUser: CurrentUserQuery["currentUser"] | null | undefined;
}

export const ReviewCard: FC<ReviewCardProps> = ({ review, currentUser }) => {
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  // Formatting helper
  const isOwner = currentUser && review.userReviewerId === currentUser.id;

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: review.title || "",
    body: review.body || "",
    rating: review.rating || 5,
  });

  // Comment State
  const [isReplying, setIsReplying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const comments = review.commentsByMovieReviewId?.nodes || [];

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const startEdit = () => {
    setIsEditing(true);
    setEditForm({
      title: review.title || "",
      body: review.body || "",
      rating: review.rating || 5,
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({ title: "", body: "", rating: 5 });
  };

  const saveEdit = async () => {
    try {
      await updateReview({
        id: review.id,
        patch: {
          title: editForm.title,
          body: editForm.body,
          rating: editForm.rating,
        },
      });
      setIsEditing(false);
      toast.success("Review updated successfully");
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview({ id: review.id }).unwrap();
      setShowDeleteDialog(false);
      toast.success("Review deleted successfully");
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review");
    }
  };

  return (
    <Card className="bg-muted/50 border-border/50">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-4">
          {isEditing ? (
            <div className="flex-1 space-y-2">
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Review Title"
                className="font-semibold text-lg h-auto py-1 px-2"
              />
            </div>
          ) : (
            <h4 className="font-semibold text-lg flex-1">{review.title}</h4>
          )}

          <div className="flex items-center gap-4">
            {isEditing ? (
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setEditForm((prev) => ({ ...prev, rating: star }))
                    }
                    className="focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= editForm.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (review.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            )}

            {isOwner && !isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={startEdit}
                  aria-label={`Edit review of ${review.title}`}
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                </Button>
                <AlertDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {TEXT.DELETE_CONFIRMATION_TITLE}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {TEXT.DELETE_REVIEW_CONFIRMATION_DESC}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{TEXT.CANCEL}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? "Deleting..." : TEXT.DELETE}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              aria-label="Review body"
              value={editForm.body}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, body: e.target.value }))
              }
              placeholder="Write your review here..."
              className="min-h-[100px] text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelEdit}
                className="h-8 w-8 p-0"
                aria-label="Cancel edit"
              >
                <X className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={saveEdit}
                className="h-8 w-8 p-0"
                disabled={!editForm.title || !editForm.body || isUpdating}
                aria-label="Save review"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
              {review.body}
            </p>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  Reply
                </Button>
                {comments.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 text-muted-foreground"
                    onClick={() => setShowComments(!showComments)}
                  >
                    {showComments ? "Hide" : "Show"} Comments ({comments.length}
                    )
                  </Button>
                )}
              </div>
              <span className="text-xs text-muted-foreground italic">
                — {review.userByUserReviewerId?.name || "Anonymous"}
              </span>
            </div>

            {isReplying && (
              <CommentForm
                reviewId={review.id}
                onCancel={() => setIsReplying(false)}
                onSuccess={() => {
                  setIsReplying(false);
                  setShowComments(true);
                }}
              />
            )}

            {showComments && (
              <CommentList comments={comments} currentUser={currentUser} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
