import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    expect(result.current).toBe("initial");

    // Change value
    act(() => {
      rerender({ value: "updated", delay: 500 });
    });

    // Should still be initial
    expect(result.current).toBe("initial");

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now should be updated
    expect(result.current).toBe("updated");
  });

  it("cancels previous timeout on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "v1", delay: 500 },
      }
    );

    act(() => {
      rerender({ value: "v2", delay: 500 });
    });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    act(() => {
      rerender({ value: "v3", delay: 500 });
    });

    // Should still be v1 (timeout was cancelled)
    expect(result.current).toBe("v1");

    // Fast forward remaining time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now should be v3
    expect(result.current).toBe("v3");
  });
});

