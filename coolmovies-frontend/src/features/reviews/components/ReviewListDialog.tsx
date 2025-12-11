"use client";

import React, { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "../../../state";
import { actions } from "../state/slice";
import {
  useCurrentUserQuery,
  useMovieReviewsQuery,
  useAllMoviesQuery,
  useAllUsersQuery,
  MovieReviewFilter,
} from "../../../generated/graphql";
import { ReviewCard } from "./ReviewCard";
import { useReviewFilters } from "../hooks/useReviewFilters";

export const ReviewListDialog: FC = () => {
  const dispatch = useAppDispatch();
  const { selectedMovieId, isViewReviewsOpen } = useAppSelector(
    (state) => state.reviews
  );
  const { data: userData } = useCurrentUserQuery();
  const { data: moviesData } = useAllMoviesQuery(); // Access cached movies
  const { data: allUsersData } = useAllUsersQuery();
  const currentUser = userData?.currentUser;

  const {
    searchTerm,
    setSearchTerm,
    ratingFilter,
    userFilter,
    searchFilter,
    updateFilter,
    clearFilters,
  } = useReviewFilters();

  const constructFilter = (): MovieReviewFilter | undefined => {
    const filters: MovieReviewFilter[] = [];

    if (ratingFilter) {
      filters.push({ rating: { equalTo: ratingFilter } });
    }

    if (userFilter) {
      filters.push({ userReviewerId: { equalTo: userFilter } });
    }

    if (searchFilter) {
      filters.push({
        or: [
          { title: { includesInsensitive: searchFilter } },
          { body: { includesInsensitive: searchFilter } },
        ],
      });
    }

    return filters.length > 0 ? { and: filters } : undefined;
  };

  const { data: reviewsData, isLoading: reviewsLoading } = useMovieReviewsQuery(
    { id: selectedMovieId!, filter: constructFilter() },
    { skip: !selectedMovieId }
  );
  const selectedMovie = moviesData?.allMovies?.nodes?.find(
    (m) => m?.id === selectedMovieId
  );
  const allUsers = allUsersData?.allUsers?.nodes;

  const handleClose = () => {
    dispatch(actions.closeViewReviews());
    clearFilters(); // Clear filters on close
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

        <div className="flex flex-col gap-4 py-4 border-b pb-4">
          <Input
            placeholder="Search reviews by title or body..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            <Select
              value={ratingFilter ? String(ratingFilter) : "all"}
              onValueChange={(value) =>
                updateFilter("rating", value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <SelectItem key={rating} value={String(rating)}>
                    {rating} Star{rating > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={userFilter || "all"}
              onValueChange={(value) =>
                updateFilter("user", value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {allUsers?.map(
                  (user) =>
                    user && (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    )
                )}
              </SelectContent>
            </Select>

            {(ratingFilter || userFilter || searchTerm) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
          {reviewsLoading ? (
            <div className="flex justify-center items-center h-full">
              Loading reviews...
            </div>
          ) : !reviewsData?.movieById?.movieReviewsByMovieId?.nodes ||
            reviewsData.movieById.movieReviewsByMovieId.nodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {ratingFilter || userFilter || searchFilter
                ? "No reviews match your filters."
                : "No reviews yet. Be the first to share your thoughts!"}
            </div>
          ) : (
            reviewsData.movieById.movieReviewsByMovieId.nodes.map((review) => {
              if (!review) return null;
              return (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUser={currentUser}
                />
              );
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
