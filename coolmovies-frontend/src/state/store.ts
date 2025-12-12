import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { exampleReducer } from '../features/example/state';

import { api } from './api';
import { enhancedApi } from './enhancedApi';

const rootReducer = combineReducers({

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

import { RootState } from './types';
export type { RootState };
export type AppStore = ReturnType<typeof createStore>;
// RootState is now imported from './types'
export type AppDispatch = AppStore['dispatch'];

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
