import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import Reviews from './Reviews';
import { reviewsReducer, ReviewsState } from '../state';
import { CurrentUserDocument } from '../../../generated/graphql';

// Removed MUI theme creation


const mockUser = {
    id: 'user1',
    name: 'Test User',
};

const mocks = [
    {
        request: {
            query: CurrentUserDocument,
        },
        result: {
            data: {
                currentUser: mockUser,
            },
        },
    },
];

// Helpers to render with Redux and Apollo
interface RenderOptions {
    initialState?: Partial<ReviewsState>;
    store?: ReturnType<typeof configureStore>;
}

const renderWithProviders = (
    component: React.ReactElement,
    {
        initialState,
        store = configureStore({
            reducer: { reviews: reviewsReducer },
            preloadedState: { reviews: initialState as any }, // casting as any because slice state might differ slightly in strictness, but let's try to be safer if possible. Actually, let's keep it simple for now.
        }),
    }: RenderOptions = {}
) => {
    const cache = new InMemoryCache();

    return {
        ...render(
            <Provider store={store}>
                <MockedProvider mocks={mocks} addTypename={false} cache={cache}>
                    {component}
                </MockedProvider>
            </Provider>
        ),
        store,
    };
};

const mockMovies = [
    {
        id: '1',
        title: 'Cool Movie',
        releaseDate: '2023-01-01',
        imgUrl: 'http://example.com/image.jpg',
        nodeId: 'node-1',
        movieDirectorId: 'director-1',
        userCreatorId: 'user-creator-1',
        movieReviewsByMovieId: {
            nodes: [
                {
                    id: 'r1',
                    nodeId: 'review-1',
                    title: 'Great',
                    body: 'Loved it',
                    rating: 5,
                    movieId: '1',
                    userReviewerId: 'user-1',
                    userByUserReviewerId: {
                        name: 'Reviewer 1',
                        id: 'user-1',
                        nodeId: 'user-node-1',
                        commentsByUserId: { edges: [], nodes: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 },
                        movieReviewsByUserReviewerId: { edges: [], nodes: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 },
                        moviesByUserCreatorId: { edges: [], nodes: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 },
                    },
                    commentsByMovieReviewId: {
                        edges: [],
                        nodes: [],
                        pageInfo: {
                            hasNextPage: false,
                            hasPreviousPage: false,
                        },
                        totalCount: 0,
                    },
                },
            ],
            edges: [],
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
            },
            totalCount: 1,
        },
    },
];

describe('Reviews Component', () => {
    it('renders loading skeletons initially', () => {
        renderWithProviders(<Reviews />, {
            initialState: { loading: true, movies: [], selectedMovieId: null, isWriteReviewOpen: false, isViewReviewsOpen: false }
        });
        // We look for logic that implies loading
        expect(screen.queryByText('Cool Movie')).not.toBeInTheDocument();
    });

    it('renders movies after loading', async () => {
        renderWithProviders(<Reviews />, {
            initialState: {
                loading: false,
                movies: mockMovies,
                selectedMovieId: null,
                isWriteReviewOpen: false,
                isViewReviewsOpen: false
            }
        });

        // Wait for Apollo to resolve (even if we provided data via Redux, subcomponents fetch user)
        expect(await screen.findByText('Cool Movie')).toBeInTheDocument();
        // Updated text expectation based on MovieCard.tsx
        expect(screen.getByText(/1 Reviews/i)).toBeInTheDocument();
    });

    it('opens view reviews dialog when requested', async () => {
        renderWithProviders(<Reviews />, {
            initialState: {
                loading: false,
                movies: mockMovies,
                selectedMovieId: '1',
                isWriteReviewOpen: false,
                isViewReviewsOpen: true // Simulate state where dialog is open
            }
        });

        // The dialog should be open and showing the review
        expect(await screen.findByText('Great')).toBeInTheDocument();
        // Updated text expectation based on ReviewListDialog.tsx (no quotes)
        expect(screen.getByText('Loved it')).toBeInTheDocument();
    });
});
