import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import reviewsReducer from "./features/reviews/state/slice";

// Mocks removed as they are unused by tests
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: any;
  store?: any;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Create a new store instance for every test
    store = configureStore({
      reducer: { reviews: reviewsReducer } as any,
      preloadedState,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>): React.JSX.Element {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }
  // @ts-ignore
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
