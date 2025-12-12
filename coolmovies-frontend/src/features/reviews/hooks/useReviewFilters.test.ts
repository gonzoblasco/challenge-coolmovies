import { renderHook, act, waitFor } from "@testing-library/react";
import { useReviewFilters } from "./useReviewFilters";

// Mock Next.js router hooks
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/reviews",
}));

jest.mock("../../../hooks/useDebounce", () => ({
  useDebounce: (value: string) => value, // Return immediately for testing
}));

describe("useReviewFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear search params
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
  });

  it("returns initial undefined filters when no URL params", () => {
    const { result } = renderHook(() => useReviewFilters());

    expect(result.current.ratingFilter).toBeUndefined();
    expect(result.current.userFilter).toBeUndefined();
    expect(result.current.searchFilter).toBeUndefined();
    expect(result.current.searchTerm).toBe("");
  });

  it("parses filters from URL", () => {
    mockSearchParams.set("rating", "5");
    mockSearchParams.set("user", "user-123");
    mockSearchParams.set("search", "great movie");

    const { result } = renderHook(() => useReviewFilters());

    expect(result.current.ratingFilter).toBe(5);
    expect(result.current.userFilter).toBe("user-123");
    expect(result.current.searchFilter).toBe("great movie");
    expect(result.current.searchTerm).toBe("great movie");
  });

  it("updates filter in URL", () => {
    // Clear any existing params first
    mockSearchParams.forEach((_, key) => mockSearchParams.delete(key));
    
    const { result } = renderHook(() => useReviewFilters());

    act(() => {
      result.current.updateFilter("rating", 4);
    });

    expect(mockPush).toHaveBeenCalledWith(
      "/reviews?rating=4",
      { scroll: false }
    );
  });

  it("removes filter when value is null", () => {
    mockSearchParams.set("rating", "5");
    mockSearchParams.set("user", "user-123");

    const { result } = renderHook(() => useReviewFilters());

    act(() => {
      result.current.updateFilter("rating", null);
    });

    expect(mockPush).toHaveBeenCalledWith(
      "/reviews?user=user-123",
      { scroll: false }
    );
  });

  it("clears all filters", () => {
    mockSearchParams.set("rating", "5");
    mockSearchParams.set("user", "user-123");
    mockSearchParams.set("search", "movie");

    const { result } = renderHook(() => useReviewFilters());

    act(() => {
      result.current.clearFilters();
    });

    expect(mockPush).toHaveBeenCalledWith("/reviews", { scroll: false });
  });

  it("updates searchTerm locally", () => {
    const { result } = renderHook(() => useReviewFilters());

    act(() => {
      result.current.setSearchTerm("new search");
    });

    expect(result.current.searchTerm).toBe("new search");
  });
});
