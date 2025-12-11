import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { CreateStoreOptions } from './types';
import { exampleEpics, exampleReducer } from '../features/example/state';
import { reviewsEpics, reviewsReducer } from '../features/reviews/state';
import { api } from './api';
import { enhancedApi } from './enhancedApi';

const rootEpic = combineEpics<any, any, RootState>(exampleEpics, reviewsEpics);

export const createStore = ({ epicDependencies }: CreateStoreOptions) => {
  if (!epicDependencies) {
    throw new Error(
      'epicDependencies is required for store initialization (needed by legacy example epic)'
    );
  }

  const epicMiddleware = createEpicMiddleware({
    dependencies: epicDependencies,
  });

  const createdStore = configureStore({
    reducer: {
      reviews: reviewsReducer,
      example: exampleReducer,
      [enhancedApi.reducerPath]: enhancedApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(epicMiddleware, enhancedApi.middleware),
  });

  epicMiddleware.run(rootEpic as any);

  return createdStore;
};

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
