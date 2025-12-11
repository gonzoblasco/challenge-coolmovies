import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ReviewListDialog } from './ReviewListDialog';
import reviewsReducer from '../state/slice';
import { MovieReviewsDocument, CurrentUserDocument, UpdateReviewDocument } from '../../../generated/graphql';

// Mocks
const movieReviewsMock = {
    request: {
        query: MovieReviewsDocument,
        variables: { id: '1' }
    },
    result: {
        data: {
            movieById: {
                __typename: 'Movie',
                id: '1',
                title: 'Cool Movie',
                movieReviewsByMovieId: {
                    __typename: 'MovieReviewsConnection',
                    nodes: [
                        {
                            __typename: 'MovieReview',
                            id: 'r1',
                            title: 'Great',
                            body: 'Loved it',
                            rating: 5,
                            userReviewerId: 'user-1',
                            userByUserReviewerId: {
                                __typename: 'User',
                                name: 'Reviewer 1'
                            }
                        }
                    ]
                }
            }
        }
    }
};

const currentUserMock = {
    request: {
        query: CurrentUserDocument,
    },
    result: {
        data: {
            currentUser: {
                __typename: 'User',
                id: 'user-1',
                name: 'Reviewer 1'
            }
        }
    }
};

const updateMock = {
    request: {
        query: UpdateReviewDocument,
        variables: {
            id: 'r1',
            patch: {
                title: 'Updated Title',
                body: 'Updated Body',
                rating: 5,
            },
        },
    },
    result: {
        data: {
            updateMovieReviewById: {
                __typename: 'UpdateMovieReviewPayload',
                movieReview: {
                    __typename: 'MovieReview',
                    id: 'r1',
                    title: 'Updated Title',
                    body: 'Updated Body',
                    rating: 5,
                },
            },
        },
    },
};

const renderComponent = () => {
    const store = configureStore({
        reducer: { reviews: reviewsReducer },
        preloadedState: {
            reviews: {
                movies: [{ id: '1', title: 'Cool Movie', movieReviewsByMovieId: { nodes: [] } } as any],
                selectedMovieId: '1',
                isViewReviewsOpen: true,
                isWriteReviewOpen: false,
                loading: false,
                error: undefined
            }
        }
    });

    return render(
        <Provider store={store}>
            <MockedProvider mocks={[movieReviewsMock, currentUserMock, updateMock]} addTypename={false}>
                <ReviewListDialog />
            </MockedProvider>
        </Provider>
    );
};

describe('ReviewListDialog Isolated', () => {
    it('renders reviews successfully', async () => {
        renderComponent();
        expect(await screen.findByText('Great')).toBeInTheDocument();
    });

    it('allows editing a review', async () => {
        renderComponent();

        // Wait for load
        expect(await screen.findByText('Great')).toBeInTheDocument();

        // Click edit
        const editBtn = await screen.findByRole('button', { name: 'Edit review' });
        fireEvent.click(editBtn);

        // Change inputs
        const titleInput = screen.getByPlaceholderText('Review Title');
        const bodyInput = screen.getByPlaceholderText('Write your review here...');

        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
        fireEvent.change(bodyInput, { target: { value: 'Updated Body' } });

        // Save
        const saveBtn = screen.getByRole('button', { name: 'Save review' });
        fireEvent.click(saveBtn);

        // Verify optimistic update
        await waitFor(() => {
            expect(screen.getByText('Updated Title')).toBeInTheDocument();
            expect(screen.getByText('Updated Body')).toBeInTheDocument();
        });
    });
});
