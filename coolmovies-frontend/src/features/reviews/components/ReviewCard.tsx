import React, { FC, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Pencil, Check, X } from "lucide-react";
import {
  useUpdateReviewMutation,
  useCurrentUserQuery,
} from "../../../generated/graphql";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";

interface ReviewCardProps {
  review: any; // Using any for simplicity as referencing generated types can be tricky if not exported
}

export const ReviewCard: FC<ReviewCardProps> = ({ review }) => {
  const { data: userData } = useCurrentUserQuery();
  const [updateReview] = useUpdateReviewMutation();
  const currentUser = userData?.currentUser;

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
        variables: {
          id: review.id,
          patch: {
            title: editForm.title,
            body: editForm.body,
            rating: editForm.rating,
          },
        },
        optimisticResponse: {
          updateMovieReviewById: {
            __typename: "UpdateMovieReviewPayload",
            movieReview: {
              __typename: "MovieReview",
              id: review.id,
              title: editForm.title,
              body: editForm.body,
              rating: editForm.rating,
              // Preserve other fields
              movieReviewId: review.movieReviewId,
              userReviewerId: review.userReviewerId,
              movieId: review.movieId,
            } as any,
          },
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update review:", error);
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={startEdit}
                aria-label="Edit review"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
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
                disabled={!editForm.title || !editForm.body}
                aria-label="Save review"
              >
                <Check className="w-4 h-4" />
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

            {showComments && <CommentList comments={comments} />}
          </>
        )}
      </CardContent>
    </Card>
  );
};
