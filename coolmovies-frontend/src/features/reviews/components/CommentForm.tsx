import React, { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCommentMutation,
  useCurrentUserQuery,
  NewCommentFragmentDoc,
} from "../../../generated/graphql";
import { Send } from "lucide-react";

interface CommentFormProps {
  reviewId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CommentForm: FC<CommentFormProps> = ({
  reviewId,
  onCancel,
  onSuccess,
}) => {
  const { data: userData, loading: userLoading } = useCurrentUserQuery();
  const [createComment, { loading }] = useCreateCommentMutation();
  const [form, setForm] = useState({ title: "", body: "" });
  const [error, setError] = useState<string | null>(null);

  const currentUser = userData?.currentUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !form.body.trim()) return;
    setError(null);

    try {
      await createComment({
        variables: {
          title: form.title,
          body: form.body,
          reviewId: reviewId,
          userId: currentUser.id,
        },
        update: (cache, { data }) => {
          const newComment = data?.createComment?.comment;
          if (!newComment) return;

          const newCommentRef = cache.writeFragment({
            data: newComment,
            fragment: NewCommentFragmentDoc,
          });

          const reviewCacheId = cache.identify({
            __typename: "MovieReview",
            id: reviewId,
          });

          if (!reviewCacheId) return;

          cache.modify({
            id: reviewCacheId,
            fields: {
              commentsByMovieReviewId(existingCommentConnection = {}) {
                const existingNodes = existingCommentConnection.nodes || [];
                return {
                  ...existingCommentConnection,
                  nodes: [...existingNodes, newCommentRef],
                };
              },
            },
          });
        },
      });
      setForm({ title: "", body: "" });
      onSuccess();
    } catch (error) {
      console.error("Failed to post comment:", error);
      setError("Failed to post comment. Please try again.");
    }
  };

  if (userLoading) return null;

  if (!currentUser) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        Please login to comment.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 mt-4 border-l-2 border-primary/20 pl-4 py-2"
    >
      <Input
        aria-label="Comment title"
        placeholder="Title (optional)"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="h-8 text-sm"
      />
      <Textarea
        aria-label="Comment body"
        placeholder="Write a comment..."
        value={form.body}
        onChange={(e) => setForm({ ...form, body: e.target.value })}
        className="min-h-[60px] text-sm"
      />
      {error && <div className="text-sm text-destructive">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={loading || !form.body.trim()}>
          <Send className="w-3 h-3 mr-2" />
          Reply
        </Button>
      </div>
    </form>
  );
};
