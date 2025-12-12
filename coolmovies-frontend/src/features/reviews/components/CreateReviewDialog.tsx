"use client";

import React, { FC, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "../../../state";
import { actions } from "../state/slice";
import {
  useCurrentUserQuery,
  useAllMoviesQuery,
} from "../../../generated/graphql";
import { useCreateReview } from "../hooks/useCreateReview";
import { Star } from "lucide-react";
import { toast } from "sonner";

export const CreateReviewDialog: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // URL State
  const movieId = searchParams.get("movieId");
  const action = searchParams.get("action");
  const isWriteReviewOpen = action === "write-review" && !!movieId;
  const selectedMovieId = isWriteReviewOpen ? movieId : null;

  const { loading: sliceLoading } = useAppSelector((state) => state.reviews);

  // Use RTK Query to get cache access to movies
  const { data: moviesData } = useAllMoviesQuery();
  const { data: userData } = useCurrentUserQuery();

  const currentUser = userData?.currentUser;

  const selectedMovie = React.useMemo(
    () =>
      moviesData?.allMovies?.nodes.find((m: any) => m?.id === selectedMovieId),
    [moviesData?.allMovies?.nodes, selectedMovieId]
  );

  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    if (isWriteReviewOpen) {
      setRating(0);
      setTitle("");
      setBody("");
      setHoverRating(0);
    }
  }, [isWriteReviewOpen]);

  const [createReview, { isLoading: loading }] = useCreateReview();

  const navigateToViewReviews = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("action", "view-reviews");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClose = () => {
    navigateToViewReviews();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  const handleSubmit = async () => {
    if (!selectedMovieId || !currentUser || !rating) return;

    try {
      await createReview({
        title,
        body,
        rating,
        movieId: selectedMovieId,
        userId: currentUser.id,
      }).unwrap();

      // Close dialog on success -> Go to view reviews
      navigateToViewReviews();

      toast.success("Review published successfully!");
    } catch (error) {
      console.error("Failed to create review", error);
      toast.error("Failed to publish review. Please try again.");
    }
  };

  if (!selectedMovie) return null;

  return (
    <Dialog open={isWriteReviewOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Write a Review for {selectedMovie.title}</DialogTitle>
          <DialogDescription>
            Share your thoughts and rating for this movie.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Great Movie!"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating ? `${rating}/5` : "Select a rating"}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="review">Review</Label>
            <Textarea
              id="review"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell us what you thought..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !body || !rating || loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
