import { api } from '../generated/graphql';

export const enhancedApi = api.enhanceEndpoints({
  endpoints: {
    AllMovies: {
      providesTags: ['Movie'],
    },
    MovieReviews: {
      providesTags: (result) =>
        result?.movieById?.movieReviewsByMovieId?.nodes
          ? [
              ...result.movieById.movieReviewsByMovieId.nodes.map((node) => ({
                type: 'Review' as const,
                id: node?.id,
              })),
              { type: 'Review', id: 'LIST' },
            ]
          : [{ type: 'Review', id: 'LIST' }],
    },
    CreateReview: {
      invalidatesTags: ['Movie', { type: 'Review', id: 'LIST' }],
      onQueryStarted: async ({ title, body, rating, movieId, userId }, { dispatch, queryFulfilled, getState }) => {
        // Optimistic Update
        const patchResult = dispatch(
          api.util.updateQueryData('MovieReviews', { id: movieId, filter: undefined }, (draft) => {
            // Access current user from cache to fake the author
             // @ts-ignore - Accessing the root state type which is not easily available here without circular dependency
            const state = getState() as any;
            // Trying to find currentUser in the cache
            const currentUserQuery = api.endpoints.CurrentUser.select(undefined)(state);
            const user = currentUserQuery.data?.currentUser;

            if (draft.movieById?.movieReviewsByMovieId?.nodes) {
              draft.movieById.movieReviewsByMovieId.nodes.unshift({
                // @ts-ignore - Partial review object
                id: 'temp-id-' + Date.now(),
                title,
                body,
                rating,
                userReviewerId: userId,
                userByUserReviewerId: user ? { ...user } : { id: userId, name: 'You', __typename: 'User' },
                commentsByMovieReviewId: { nodes: [], __typename: 'CommentsConnection' },
                __typename: 'MovieReview',
              });
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    },
    UpdateReview: {
      invalidatesTags: (result, error, { id }) => [
        { type: 'Review', id },
        { type: 'Review', id: 'LIST' },
      ],
    },
    CreateComment: {
      invalidatesTags: (result, error, { reviewId }) => [
        { type: 'Review', id: reviewId },
      ],
    },
    DeleteComment: {
      invalidatesTags: (result) => {
        const movieReviewId = result?.deleteCommentById?.comment?.movieReviewId;
        return movieReviewId
          ? [{ type: 'Review', id: movieReviewId }]
          : [{ type: 'Review', id: 'LIST' }];
      },
    },
    DeleteReview: {
      invalidatesTags: (result) => {
        const movieId = result?.deleteMovieReviewById?.movieReview?.movieId;
        return movieId
          ? ['Movie', { type: 'Review', id: 'LIST' }]
          : [{ type: 'Review', id: 'LIST' }];
      },
    },
  },
});
