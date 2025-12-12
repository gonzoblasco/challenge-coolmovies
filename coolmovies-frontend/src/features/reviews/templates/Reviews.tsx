import React, { useState } from "react";
import { errorService } from "@/services/errorService";
import dynamic from "next/dynamic";
import { useAppSelector } from "../../../state";
import { useAllMoviesQuery, Movie } from "../../../generated/graphql";
import { MovieCard } from "../components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Lazy load dialogs
const ReviewListDialog = dynamic(
  () => import("../components/ReviewListDialog").then((mod) => mod.ReviewListDialog),
  { ssr: false }
);
const CreateReviewDialog = dynamic(
  () => import("../components/CreateReviewDialog").then((mod) => mod.CreateReviewDialog),
  { ssr: false }
);

const PAGE_SIZE = 12;

const Reviews = () => {
  const [page, setPage] = useState(0);

  const {
    data,
    isLoading: loading,
    error: queryError,
    isFetching,
  } = useAllMoviesQuery({
    first: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  // Combine errors if necessary, or just use queryError

  const errorMessage = queryError
    ? (errorService.log(queryError, "Reviews.useAllMoviesQuery"),
      "We could not load the movies. Please try reloading the page.")
    : null;
  const movies = data?.allMovies?.nodes || [];
  const totalCount = data?.allMovies?.totalCount || 0;

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handlePrevious = () => {
    setPage((p) => Math.max(0, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    setPage((p) => Math.min(totalPages - 1, p + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div id="main-content" className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-center mb-12 sm:text-5xl text-primary">
          Movie Reviews
        </h1>

        {errorMessage && (
          <div
            className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-8 text-center"
            role="alert"
          >
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-live="polite"
          aria-busy={loading}
        >
          {loading ? (
            <div
              className="col-span-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
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
              .map((movie, index) => (
                <MovieCard key={movie.id} movie={movie as Movie} index={index} />
              ))
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && !errorMessage && totalCount > 0 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={page === 0 || isFetching}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {page + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={page >= totalPages - 1 || isFetching}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Dialogs controlled by Redux state */}
        <ReviewListDialog />
        <CreateReviewDialog />
      </div>
    </div>
  );
};

export default Reviews;
