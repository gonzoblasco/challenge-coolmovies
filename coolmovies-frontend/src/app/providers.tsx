"use client";
import "../lib/observable-polyfill";

/**
 * Providers Component - App Router Compatible
 *
 * This component wraps the application with necessary providers for Redux and Apollo Client.
 *
 * Key Design Decisions:
 * - Uses `useRef` instead of `useState` + `useEffect` to ensure the store is initialized
 *   immediately on first render, supporting proper SSR/RSC in Next.js App Router
 * - No loading state is shown, allowing the server to render the initial HTML with content
 * - Apollo Client is retained for the legacy `exampleAsyncEpic` which still depends on it
 * - Once the example epic is fully migrated to RTK Query, Apollo Client can be removed
 */

import React, { FC, useRef, PropsWithChildren } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "../state";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  // Initialize store once per client session using useRef
  // This ensures the store is created immediately on first render (not in useEffect)
  // Supporting proper SSR/RSC in App Router
  const storeRef = useRef(
    createStore({
      epicDependencies: {
        client: new ApolloClient({
          cache: new InMemoryCache(),
          link: new HttpLink({
            uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "/graphql",
          }),
        }),
      },
    })
  );

  // Extract the Apollo Client from the store's epic dependencies
  // This is needed for the ApolloProvider wrapper (used by legacy example epic)
  const clientRef = useRef(
    new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "/graphql",
      }),
    })
  );

  return (
    <ReduxProvider store={storeRef.current}>
      <ApolloProvider client={clientRef.current}>{children}</ApolloProvider>
    </ReduxProvider>
  );
};
