import React, { FC } from "react";
// import { useRouter } from "next/router";
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
  useAllUsersQuery,
  MovieReviewFilter,
} from "../../../generated/graphql";
import { ReviewCard } from "./ReviewCard";
import { useReviewFilters } from "../hooks/useReviewFilters";

export const ReviewListDialog: FC = () => {
  const dispatch = useAppDispatch();
  // const router = useRouter();
  const { movies, selectedMovieId, isViewReviewsOpen } = useAppSelector(
    (state) => state.reviews
  );
  const { data: userData } = useCurrentUserQuery();
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

  const { data: reviewsData, loading: reviewsLoading } = useMovieReviewsQuery({
    variables: {
      id: selectedMovieId as any,
      filter: constructFilter(),
    },
    skip: !selectedMovieId,
  });

  const selectedMovie = movies.find((m) => m.id === selectedMovieId);

  const handleClose = () => {
    clearFilters();
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

          <Select
            value={ratingFilter ? ratingFilter.toString() : "all"}
            onValueChange={(val) =>
              updateFilter("rating", val === "all" ? null : parseInt(val))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              {[5, 4, 3, 2, 1].map((r) => (
                <SelectItem key={r} value={r.toString()}>
                  {r} Stars
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={userFilter || "all"}
            onValueChange={(val) =>
              updateFilter("user", val === "all" ? null : val)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {(allUsersData?.allUsers?.nodes ?? [])
                .filter((user) => !!user)
                .map((user) => (
                  <SelectItem key={user!.id} value={user!.id}>
                    {user!.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
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
