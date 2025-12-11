
import { MovieReviewFilter } from "../../../generated/graphql";

interface FilterParams {
  ratingFilter: number | null;
  userFilter: string | null;
  searchFilter: string;
}

export const constructFilter = ({
  ratingFilter,
  userFilter,
  searchFilter,
}: FilterParams): MovieReviewFilter | undefined => {
  const filters: MovieReviewFilter[] = [];

  if (ratingFilter !== null) {
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
