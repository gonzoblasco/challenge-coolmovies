import { createStore } from "./store";
import { enhancedApi } from "./enhancedApi";

describe("Redux Store Integration", () => {
  it("should initialize with correct reducer structure", () => {
    const store = createStore();
    const state = store.getState();
    expect(state).toHaveProperty("reviews");
    expect(state).toHaveProperty("api");
  });

  it("should have enhancedApi middleware configured", () => {
    const store = createStore();
    // Basic check to ensure the API slice is registered
    const state = store.getState();
    expect(state).toHaveProperty("api");
  });

  it("should have correct initial state for reviews", () => {
     const store = createStore();
     expect(store.getState().reviews.filterPanelOpen).toBe(false);
  });
});
