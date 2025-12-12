import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { MockLink, MockedResponse } from "@apollo/client/testing";
import reviewsReducer from "./features/reviews/state/slice";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: any;
  store?: any;
  mocks?: MockedResponse[];
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Create a new store instance for every test
    store = configureStore({
      reducer: { reviews: reviewsReducer },
      preloadedState,
    }),
    mocks = [],
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>): React.JSX.Element {
    const client = new ApolloClient({
      cache: new InMemoryCache({}),
      link: new MockLink(mocks),
    });

    return (
      <Provider store={store}>
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </Provider>
    );
  }
  // @ts-ignore
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
