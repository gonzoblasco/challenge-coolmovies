import { gql } from '@apollo/client';
import { Epic, StateObservable } from 'redux-observable';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { actions, SliceAction } from './slice';
import { RootState } from '../../../state/store';
import { EpicDependencies } from '../../../state/types';


export const exampleEpic: Epic<
  SliceAction['increment'],
  any,
  RootState,
  EpicDependencies
> = (action$, state$) =>
  action$.pipe(
    filter(actions.increment.match),
    filter(() => Boolean(state$.value.example.value % 2)),
    map(() => actions.epicSideEffect())
  );

export const exampleAsyncEpic: Epic<
  SliceAction['increment'],
  any,
  RootState,
  EpicDependencies
> = (action$, state$, { client }) =>
  action$.pipe(
    filter(actions.fetch.match),
    // detailed implementation disabled during migration to unblock build
    map(() => actions.loaded({ data: { currentUser: null } }))
  );
