import { combineEpics, Epic } from 'redux-observable';
import { fetchMoviesEpic, createReviewEpic } from './epics';
import { RootState } from '../../../state/store';
import { EpicDependencies } from '../../../state/types';

export { default as reviewsReducer } from './slice';
export * from './slice';

export const reviewsEpics: Epic<any, any, RootState, EpicDependencies> = combineEpics(
    fetchMoviesEpic,
    createReviewEpic
);
