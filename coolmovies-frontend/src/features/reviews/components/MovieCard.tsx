import React, { FC, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Movie } from "../../../generated/graphql";
import { useAppDispatch } from "../../../state";
import { actions } from "../state/slice";
import { useCurrentUserQuery } from "../../../generated/graphql";
import { Star } from "lucide-react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: FC<MovieCardProps> = ({ movie }) => {
  const dispatch = useAppDispatch();
  const { data: userData } = useCurrentUserQuery();
  const currentUser = userData?.currentUser;

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [imgSrc, setImgSrc] = useState(movie.imgUrl);
  const [altText, setAltText] = useState(`Poster of ${movie.title}`);

  const reviews = movie.movieReviewsByMovieId.nodes;
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((acc, review) => acc + (review?.rating || 0), 0) /
        reviewCount
      : 0;
  // ... (keeping other handlers the same, skipping to return for replace)

  const handleViewReviews = () => {
    dispatch(actions.openViewReviews(movie.id));
  };

  const handleWriteReview = () => {
    dispatch(actions.openWriteReview(movie.id));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={`h-full transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card border-border/40 group">
        <div
          className="relative w-full overflow-visible aspect-[2/3] bg-muted/20 cursor-pointer rounded-sm group/poster focus-visible:outline-2 focus-visible:outline-primary"
          onClick={handleViewReviews}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleViewReviews();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Read reviews for ${movie.title}`}
        >
          <Image
            src={imgSrc}
            alt={altText}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 group-focus/poster:scale-90"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
              setImgSrc("/placeholder-movie.png");
              setAltText(`${movie.title} - Image unavailable`);
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1 truncate">
              {movie.title}
            </h3>
            <p className="text-sm text-gray-300 font-medium">
              {new Date(movie.releaseDate).getFullYear()} • {reviewCount}{" "}
              Reviews
            </p>
          </div>
        </div>

        <CardContent className="flex-grow p-4 flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
              {renderStars(averageRating)}
              <span className="text-sm font-semibold ml-1">
                {averageRating.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleViewReviews}
          >
            Read
          </Button>
          <Button
            variant={currentUser ? "default" : "outline"}
            className="w-full"
            onClick={handleWriteReview}
            disabled={!currentUser}
          >
            {currentUser ? "Review" : "Log in"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
