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
import { Star, Loader2 } from "lucide-react";
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
      const message = error instanceof Error 
        ? error.message 
        : (error as any)?.data?.message || (error as any)?.message || 'Unknown error';
      toast.error(`Failed to publish review: ${message}`, {
        action: {
          label: "Retry",
          onClick: () => handleSubmit(),
        },
      });
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
            <Label id="rating-label">Rating</Label>
            <div 
              className="flex items-center gap-1"
              role="radiogroup"
              aria-labelledby="rating-label"
              onKeyDown={(e) => {
                // Handle number keys 1-5 for direct rating selection
                const num = parseInt(e.key);
                if (num >= 1 && num <= 5) {
                  e.preventDefault();
                  setRating(num);
                  return;
                }
                
                // Handle arrow keys for navigation
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setRating((prev) => Math.min(5, (prev || 0) + 1));
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  setRating((prev) => Math.max(1, (prev || 2) - 1));
                }
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={star === rating}
                  tabIndex={star === rating || (rating === 0 && star === 1) ? 0 : -1}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setRating(star);
                    }
                  }}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
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
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
