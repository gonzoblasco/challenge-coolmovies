"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "../../../hooks/useDebounce";

/**
 * Manages review filters with URL synchronization and debouncing.
 * 
 * Why: Filters need to persist across navigation and support back/forward buttons.
 * Debouncing prevents excessive URL updates during typing.
 * 
 * @returns {Object} Filter state and updater functions
 * @example
 * const { ratingFilter, updateFilter } = useReviewFilters();
 * updateFilter('rating', 5); // Updates URL to ?rating=5
 */
export const useReviewFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse filters from URL
  const ratingFilter = searchParams.get("rating")
    ? parseInt(searchParams.get("rating")!)
    : undefined;
  const userFilter = searchParams.get("user") || undefined;
  const searchFilter = searchParams.get("search") || undefined;

  // Local state for search
  const [searchTerm, setSearchTerm] = useState(searchFilter || "");

  // Debounce the local search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const updateFilter = (key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
    const queryString = params.toString();
    const dest = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(dest, { scroll: false });
  };

  // Sync local search term with URL on mount/update (e.g. back button or initial load)
  useEffect(() => {
    if ((searchFilter || "") !== searchTerm) {
      setSearchTerm(searchFilter || "");
    }
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

  // Preserve these keys when clearing filters
  const preservedKeys = ["movieId", "action"];

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Get all keys and delete the ones that are not preserved
    const keys = Array.from(params.keys());
    keys.forEach(key => {
        if (!preservedKeys.includes(key)) {
            params.delete(key);
        }
    });

    const queryString = params.toString();
    const dest = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(dest, { scroll: false });
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
