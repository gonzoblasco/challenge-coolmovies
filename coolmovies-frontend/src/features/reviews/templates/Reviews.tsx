import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../state";
import { actions } from "../state/slice";
import { useAllMoviesQuery } from "../../../generated/graphql";
import { MovieCard } from "../components/MovieCard";
import { ReviewListDialog } from "../components/ReviewListDialog";
import { CreateReviewDialog } from "../components/CreateReviewDialog";
import { Skeleton } from "@/components/ui/skeleton";

const Reviews = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading: loading, error: queryError } = useAllMoviesQuery();
  const { error: sliceError } = useAppSelector((state) => state.reviews);

  // Combine errors if necessary, or just use queryError
  const error = queryError ? "Failed to load movies" : sliceError;
  const movies = data?.allMovies?.nodes || [];

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-center mb-12 sm:text-5xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Movie Reviews
        </h1>

        {error && (
          <div
            className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-8 text-center"
            role="alert"
          >
            <span className="block sm:inline">
              Error: {JSON.stringify(error)}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div
              role="status"
              aria-live="polite"
              className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              <span className="sr-only">Loading movies...</span>
              {Array.from(new Array(6)).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex flex-col space-y-3"
                >
                  <Skeleton className="h-[400px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            movies
              .filter((m): m is NonNullable<typeof m> => m !== null)
              .map((movie) => <MovieCard key={movie.id} movie={movie as any} />)
          )}
        </div>

        {/* Dialogs controlled by Redux state */}
        <ReviewListDialog />
        <CreateReviewDialog />
      </div>
    </div>
  );
};

export default Reviews;
