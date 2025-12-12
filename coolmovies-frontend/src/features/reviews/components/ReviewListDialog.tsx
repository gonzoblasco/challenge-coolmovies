"use client";

import React, { FC, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "../../../state";

import {
  useCurrentUserQuery,
  useAllMoviesQuery,
  useAllUsersQuery,
} from "../../../generated/graphql";
import { ReviewCard } from "./ReviewCard";
import { useReviewFilters } from "../hooks/useReviewFilters";
import { useReviews } from "../hooks/useReviews";
import { List, RowComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { constructFilter } from "../utils/helpers";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Loading } from "@/components/common/Loading";

// Define the row component type for react-window v2
interface ReviewRowProps {
  reviews: NonNullable<NonNullable<ReturnType<typeof import('../hooks/useReviews').useReviews>['data']>['movieById']>['movieReviewsByMovieId']['nodes'];
  currentUser: { id: string; name: string } | null | undefined;
}

// Use function instead of FC to return ReactElement as required by react-window v2
const ReviewRow = ({ index, style, reviews, currentUser }: RowComponentProps<ReviewRowProps>): React.ReactElement => {
  const review = reviews[index];
  if (!review) return <></>;
  return (
    <div style={style} className="pb-4">
      <ReviewCard
        key={review.id}
        review={review}
        currentUser={currentUser}
      />
    </div>
  );
};

export const ReviewListDialog: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // URL State
  const movieId = searchParams.get("movieId");
  const action = searchParams.get("action");
  const isViewReviewsOpen = action === "view-reviews" && !!movieId;
  const selectedMovieId = isViewReviewsOpen ? movieId : null;

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

  const { data: reviewsData, isLoading: reviewsLoading } = useReviews(
    selectedMovieId,
    constructFilter({
      ratingFilter: ratingFilter ?? null,
      userFilter: userFilter ?? null,
      searchFilter: searchFilter ?? "",
    })
  );
  const selectedMovie = moviesData?.allMovies?.nodes?.find(
    (m) => m?.id === selectedMovieId
  );
  const allUsers = allUsersData?.allUsers?.nodes;

  const handleClose = () => {
    // On close, clear all URL parameters to reset the view.
    router.push(pathname, { scroll: false });
  };

  const handleWriteReview = () => {
    if (selectedMovieId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("action", "write-review");
      params.set("movieId", selectedMovieId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
          <DialogDescription className="sr-only">
            List of reviews for {selectedMovie.title}
          </DialogDescription>
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

        <div 
          className="flex-1 min-h-0 py-4"
          role="status"
          aria-live="polite"
          aria-busy={reviewsLoading}
        >
          <ErrorBoundary name="ReviewList">
            {reviewsLoading ? (
              <Loading lines={4} />
            ) : !reviewsData?.movieById?.movieReviewsByMovieId?.nodes ||
              reviewsData.movieById.movieReviewsByMovieId.nodes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {ratingFilter || userFilter || searchFilter ? (
                  <div className="flex flex-col items-center gap-2">
                    <span>No reviews match your filters.</span>
                    <Button onClick={clearFilters} variant="link">
                      Clear filters and view all
                    </Button>
                  </div>
                ) : (
                  "No reviews yet. Be the first to share your thoughts!"
                )}
              </div>
            ) : (
              <AutoSizer>
                {({ height, width }) => {
                  const reviews = reviewsData.movieById!.movieReviewsByMovieId!.nodes;
                  return (
                    <List
                      style={{ height, width }}
                      rowCount={reviews.length}
                      rowHeight={300}
                      rowComponent={ReviewRow}
                      rowProps={{ reviews, currentUser }}
                      className="pr-2"
                    />
                  );
                }}
              </AutoSizer>
            )}
          </ErrorBoundary>
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
