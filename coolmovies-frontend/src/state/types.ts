import { Action, ThunkAction } from '@reduxjs/toolkit';
import { reviewsReducer } from '../features/reviews/state';
import { exampleReducer } from '../features/example/state';
import { api } from './api';

export type CreateStoreOptions = {
  // epicDependencies?: EpicDependencies; // Deprecated/Unused
};

export type EpicDependencies = {
  // client: ApolloClient<NormalizedCacheObject>; // Deprecated
};

// Define RootState manually to break circular dependency
export type RootState = {
  reviews: ReturnType<typeof reviewsReducer>;
  example: ReturnType<typeof exampleReducer>;
  [api.reducerPath]: ReturnType<typeof api.reducer>;
};
