import React, { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "../../../state";
import { actions } from "../state/slice";
import {
  useCurrentUserQuery,
  useMovieReviewsQuery,
  useAllUsersQuery,
  MovieReviewFilter,
} from "../../../generated/graphql";
import { ReviewCard } from "./ReviewCard";

export const ReviewListDialog: FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { movies, selectedMovieId, isViewReviewsOpen } = useAppSelector(
    (state) => state.reviews
  );
  const { data: userData } = useCurrentUserQuery();
  const { data: allUsersData } = useAllUsersQuery();
  const currentUser = userData?.currentUser;

  // Local state for search to handle debounce
  const [searchTerm, setSearchTerm] = useState("");

  // Parse filters from URL
  const ratingFilter = router.query.rating
    ? parseInt(router.query.rating as string)
    : undefined;
  const userFilter = router.query.user
    ? (router.query.user as string)
    : undefined;
  const searchFilter = router.query.search
    ? (router.query.search as string)
    : undefined;

  // Sync local search term with URL on mount/update
  useEffect(() => {
    if (searchFilter !== searchTerm) {
      setSearchTerm(searchFilter || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter]);

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== searchFilter) {
        updateFilter("search", searchTerm || null);
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const updateFilter = (key: string, value: string | number | null) => {
    const newQuery = { ...router.query };
    if (value) {
      newQuery[key] = String(value);
    } else {
      delete newQuery[key];
    }
    router.push({ query: newQuery }, undefined, { shallow: true });
  };

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

  const { data: reviewsData, loading: reviewsLoading } = useMovieReviewsQuery({
    variables: {
      id: selectedMovieId as any,
      filter: constructFilter(),
    },
    skip: !selectedMovieId,
  });

  const selectedMovie = movies.find((m) => m.id === selectedMovieId);

  const handleClose = () => {
    const newQuery = { ...router.query };
    delete newQuery.rating;
    delete newQuery.user;
    delete newQuery.search;
    router.push({ query: newQuery }, undefined, { shallow: true });
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

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border-b">
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={ratingFilter || ""}
            onChange={(e) =>
              updateFilter(
                "rating",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Stars
              </option>
            ))}
          </select>

          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={userFilter || ""}
            onChange={(e) => updateFilter("user", e.target.value || null)}
          >
            <option value="">All Users</option>
            {allUsersData?.allUsers?.nodes.map((user) => (
              <option key={user?.id} value={user?.id}>
                {user?.name}
              </option>
            ))}
          </select>
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
