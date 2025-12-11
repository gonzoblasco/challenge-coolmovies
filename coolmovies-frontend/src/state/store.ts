import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { CreateStoreOptions } from './types';
import { exampleEpics, exampleReducer } from '../features/example/state';
import { reviewsEpics, reviewsReducer } from '../features/reviews/state';

const rootEpic = combineEpics<any, any, RootState>(exampleEpics, reviewsEpics);

export const createStore = ({ epicDependencies }: CreateStoreOptions) => {
  const epicMiddleware = createEpicMiddleware({
    dependencies: epicDependencies,
  });

  const createdStore = configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(epicMiddleware),
    reducer: {
      example: exampleReducer,
      reviews: reviewsReducer,
    },
  });

  epicMiddleware.run(rootEpic as any);

  return createdStore;
};

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
