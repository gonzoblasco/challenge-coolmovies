
import { MovieReviewsQuery } from "../../../generated/graphql";

export type Review = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<MovieReviewsQuery["movieById"]>["movieReviewsByMovieId"]
    >["nodes"]
  >[0]
>;
