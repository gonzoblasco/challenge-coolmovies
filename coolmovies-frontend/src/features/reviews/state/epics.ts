import { Epic } from 'redux-observable';
import { switchMap, map, catchError, filter } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { RootState } from '../../../state/store';
import { actions, SliceAction } from './slice';
import { EpicDependencies } from '../../../state/types';
import {
    AllMoviesDocument,
    AllMoviesQuery,
    CreateReviewDocument,
    CreateReviewMutationResult,
    CreateReviewMutationVariables
} from '../../../generated/graphql';

export const fetchMoviesEpic: Epic<
    any,
    any,
    RootState,
    EpicDependencies
> = (action$, state$, { client }) =>
        action$.pipe(
            filter(actions.fetchMovies.match),
            switchMap(() =>
                from(client.query<AllMoviesQuery>({
                    query: AllMoviesDocument,
                    fetchPolicy: 'network-only',
                })).pipe(
                    map((result) => actions.fetchMoviesSuccess(result.data.allMovies?.nodes as any[])),
                    catchError((error) => of(actions.fetchMoviesError(error.message)))
                )
            )
        );

export const createReviewEpic: Epic<
    any,
    any,
    RootState,
    EpicDependencies
> = (action$, state$, { client }) =>
        action$.pipe(
            filter(actions.createReview.match),
            switchMap((action) =>
                from(client.mutate<CreateReviewMutationResult, CreateReviewMutationVariables>({
                    mutation: CreateReviewDocument,
                    variables: {
                        title: action.payload.title,
                        body: action.payload.body,
                        rating: action.payload.rating,
                        movieId: action.payload.movieId,
                        userId: action.payload.userId,
                    },
                })).pipe(
                    switchMap(() => [
                        actions.createReviewSuccess(),
                        actions.fetchMovies() // Refetch movies to update UI
                    ]),
                    catchError((error) => of(actions.createReviewError(error.message)))
                )
            )
        );
