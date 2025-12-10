import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MockedProvider } from '@apollo/client/testing';
import Reviews from './Reviews';
import { reviewsReducer } from '../state';
import { ThemeProvider, createTheme } from '@mui/material';
import { CurrentUserDocument } from '../../../generated/graphql';

const theme = createTheme();

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
const renderWithProviders = (
    component: React.ReactElement,
    {
        initialState,
        store = configureStore({
            reducer: { reviews: reviewsReducer },
            preloadedState: { reviews: initialState },
        }),
    }: any = {}
) => {
    return {
        ...render(
            <Provider store={store}>
                <MockedProvider mocks={mocks} addTypename={false}>
                    <ThemeProvider theme={theme}>
                        {component}
                    </ThemeProvider>
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
        movieReviewsByMovieId: {
            nodes: [
                {
                    id: 'r1',
                    title: 'Great',
                    body: 'Loved it',
                    rating: 5,
                    userByUserReviewerId: {
                        name: 'Reviewer 1',
                    },
                },
            ],
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
        expect(screen.getByText('(1 reviews)')).toBeInTheDocument();
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
        expect(screen.getByText('"Loved it"')).toBeInTheDocument();
    });
});
