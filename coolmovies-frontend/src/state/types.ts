import { exampleReducer } from '../features/example/state';
import { enhancedApi } from './enhancedApi';

export type CreateStoreOptions = {
  // epicDependencies?: EpicDependencies; // Deprecated/Unused
};

export type EpicDependencies = {
  // client: ApolloClient<NormalizedCacheObject>; // Deprecated
};

// Define RootState to match the actual store structure
export type RootState = {
  example: ReturnType<typeof exampleReducer>;
  [enhancedApi.reducerPath]: ReturnType<typeof enhancedApi.reducer>;
};
