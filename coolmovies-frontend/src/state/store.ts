import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { exampleReducer } from '../features/example/state';
import { reviewsReducer } from '../features/reviews/state';
import { api } from './api';
import { enhancedApi } from './enhancedApi';

export const createStore = () => {
  const createdStore = configureStore({
    reducer: {
      reviews: reviewsReducer,
      example: exampleReducer,
      [enhancedApi.reducerPath]: enhancedApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(enhancedApi.middleware),
  });

  return createdStore;
};

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
