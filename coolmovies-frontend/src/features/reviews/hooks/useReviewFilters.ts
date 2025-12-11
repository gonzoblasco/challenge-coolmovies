import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDebounce } from "../../../hooks/useDebounce";

export const useReviewFilters = () => {
  const router = useRouter();

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

  // Local state for search
  const [searchTerm, setSearchTerm] = useState(searchFilter || "");

  // Debounce the local search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const updateFilter = (key: string, value: string | number | null) => {
    const newQuery = { ...router.query };
    if (value) {
      newQuery[key] = String(value);
    } else {
      delete newQuery[key];
    }
    router.push({ query: newQuery }, undefined, { shallow: true });
  };

  // Sync local search term with URL on mount/update (e.g. back button or initial load)
  useEffect(() => {
    if ((searchFilter || "") !== searchTerm) {
      setSearchTerm(searchFilter || "");
    }
    // We only want to sync when the URL filter changes externally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter]);

  // Update URL when debounced search term changes
  useEffect(() => {
    // Only update if the debounced term is different from the current URL filter
    // This prevents loops and unnecessary updates
    if (debouncedSearchTerm !== (searchFilter || "")) {
      updateFilter("search", debouncedSearchTerm || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const clearFilters = () => {
    const newQuery = { ...router.query };
    delete newQuery.rating;
    delete newQuery.user;
    delete newQuery.search;
    router.push({ query: newQuery }, undefined, { shallow: true });
  };

  return {
    ratingFilter,
    userFilter,
    searchFilter,
    searchTerm,
    setSearchTerm,
    updateFilter,
    clearFilters,
  };
};
