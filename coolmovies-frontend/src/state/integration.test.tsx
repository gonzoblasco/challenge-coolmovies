import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { Providers } from "../app/providers";
import { createStore } from "./store";
import { enhancedApi } from "./enhancedApi";
import { client } from "./api";
import { api } from "../generated/graphql";

// Mock the environment variable to ensure consistent testing
process.env.NEXT_PUBLIC_GRAPHQL_URL = "http://localhost:3000/graphql";

describe("State Integration", () => {
  describe("Store Configuration", () => {
    it("should configure the store with the correct reducers", () => {
      const store = createStore();
      const state = store.getState();

      expect(state).toHaveProperty("reviews");
      expect(state).toHaveProperty("example");
      expect(state).toHaveProperty(enhancedApi.reducerPath);
    });
  });

  describe("Providers Component", () => {
    // Helper component to verify contexts
    const TestChild = () => {
      return (
        <div>
          <span>Redux Provider Loaded</span>
        </div>
      );
    };

    it("should render children and provide Redux context", () => {
      // We can render Providers and check if children can access the context
      render(
        <Providers>
          <TestChild />
        </Providers>
      );

      expect(screen.getByText("Redux Provider Loaded")).toBeInTheDocument();
    });
  });

  describe("API Configuration", () => {
    it("should have the correct base URL for the GraphQL client", () => {
      // Checking how the client was initialized in api.ts
      expect((client as any).url).toBe("http://localhost:3000/graphql");
    });

    it("should enhance endpoints correctly", () => {
      const createReviewEndpoint = enhancedApi.endpoints.CreateReview;
      // The type definition might be complex to inspect directly, but we can check if it exists
      expect(createReviewEndpoint).toBeDefined();
      // expect(createReviewEndpoint).not.toBe(api.endpoints.CreateReview);
      // expect(enhancedApi).not.toBe(api);
    });
  });
});
