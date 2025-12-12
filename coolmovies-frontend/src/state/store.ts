import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { exampleReducer } from '../features/example/state';
import { reviewsReducer } from '../features/reviews/state';
import { api } from './api';
import { enhancedApi } from './enhancedApi';

const rootReducer = combineReducers({
  reviews: reviewsReducer,
  example: exampleReducer,
  [enhancedApi.reducerPath]: enhancedApi.reducer,
});

export const createStore = (preloadedState?: any) => {
  const createdStore = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(enhancedApi.middleware),
  });

  return createdStore;
};

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
