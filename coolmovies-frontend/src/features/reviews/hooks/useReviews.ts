
import { useMovieReviewsQuery, MovieReviewFilter } from "../../../generated/graphql";

export const useReviews = (movieId: string | null, filter: MovieReviewFilter | undefined) => {
  return useMovieReviewsQuery(
    { id: movieId!, filter },
    { skip: !movieId }
  );
};
