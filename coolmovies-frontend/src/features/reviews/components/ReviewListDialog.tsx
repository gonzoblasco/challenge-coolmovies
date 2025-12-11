import React, { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "../../../state";
import { actions } from "../state/slice";
import {
  useCurrentUserQuery,
  useMovieReviewsQuery,
} from "../../../generated/graphql";
import { ReviewCard } from "./ReviewCard";

export const ReviewListDialog: FC = () => {
  const dispatch = useAppDispatch();
  const { movies, selectedMovieId, isViewReviewsOpen } = useAppSelector(
    (state) => state.reviews
  );
  const { data: userData } = useCurrentUserQuery();
  const { data: reviewsData, loading: reviewsLoading } = useMovieReviewsQuery({
    variables: { id: selectedMovieId as any },
    skip: !selectedMovieId,
  });
  const currentUser = userData?.currentUser;

  const selectedMovie = movies.find((m) => m.id === selectedMovieId);

  const handleClose = () => {
    dispatch(actions.closeViewReviews());
  };

  const handleWriteReview = () => {
    dispatch(actions.closeViewReviews());
    if (selectedMovieId) {
      dispatch(actions.openWriteReview(selectedMovieId));
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  if (!selectedMovie) return null;

  return (
    <Dialog open={isViewReviewsOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-baseline gap-2">
            {selectedMovie.title}
            <span className="text-lg font-normal text-muted-foreground">
              Reviews
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
          {reviewsLoading ? (
            <div className="flex justify-center items-center h-full">
              Loading reviews...
            </div>
          ) : !reviewsData?.movieById?.movieReviewsByMovieId?.nodes ||
            reviewsData.movieById.movieReviewsByMovieId.nodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No reviews yet. Be the first to share your thoughts!
            </div>
          ) : (
            reviewsData.movieById.movieReviewsByMovieId.nodes.map((review) => {
              if (!review) return null;
              return <ReviewCard key={review.id} review={review} />;
            })
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleWriteReview} disabled={!currentUser}>
            {currentUser ? "Write a Review" : "Login to Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
