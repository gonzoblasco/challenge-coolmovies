import { combineEpics, Epic } from 'redux-observable';
// import { fetchMoviesEpic, createReviewEpic } from './epics';
import { RootState } from '../../../state/store';
import { EpicDependencies } from '../../../state/types';

export { default as reviewsReducer } from './slice';
export * from './slice';

// fetchMoviesEpic and createReviewEpic are replaced by RTK Query
export const reviewsEpics: Epic<any, any, RootState, EpicDependencies> = combineEpics();
