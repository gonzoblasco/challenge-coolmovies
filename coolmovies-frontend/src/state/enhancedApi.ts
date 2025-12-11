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
  },
});
