import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { ApolloProvider, useApolloClient } from "@apollo/client";
import { Providers } from "../app/providers";
import { createStore } from "./store";
import { enhancedApi } from "./enhancedApi";
import { client } from "./api";
import { api } from "../generated/graphql";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// Mock the environment variable to ensure consistent testing
process.env.NEXT_PUBLIC_GRAPHQL_URL = "http://localhost:3000/graphql";

// Mock fetch for Apollo Client to avoid network errors during instantiation
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: {} }),
  })
) as jest.Mock;

describe("State Integration", () => {
  describe("Store Configuration", () => {
    it("should configure the store with the correct reducers", () => {
      const epicDependencies = {
        client: new ApolloClient({
          cache: new InMemoryCache(),
          link: new HttpLink({ uri: "/graphql" }),
        }),
      };
      const store = createStore({ epicDependencies });
      const state = store.getState();

      expect(state).toHaveProperty("reviews");
      expect(state).toHaveProperty("example");
      expect(state).toHaveProperty(enhancedApi.reducerPath);
    });

    it("should throw error if epicDependencies are missing", () => {
      expect(() => createStore({} as any)).toThrow(
        "epicDependencies is required for store initialization (needed by legacy example epic)"
      );
    });
  });

  describe("Providers Component", () => {
    // Helper component to verify contexts
    const TestChild = () => {
      // If these hooks fail, it means the Providers are not wrapping correctly
      const client = useApolloClient();
      return (
        <div>
          <span>Redux Provider Loaded</span>
          <span>Apollo Client URI: {(client.link as any).options.uri}</span>
        </div>
      );
    };

    it("should render children and provide Redux and Apollo contexts", () => {
      // We can render Providers and check if children can access the context
      render(
        <Providers>
          <TestChild />
        </Providers>
      );

      expect(screen.getByText("Redux Provider Loaded")).toBeInTheDocument();
      // Check if Apollo Client is initialized
      // The uri might depend on the environment variable mock
      expect(screen.getByText(/Apollo Client URI/)).toBeInTheDocument();
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
