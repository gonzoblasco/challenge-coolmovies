import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import Reviews from './Reviews';
import { AllMoviesDocument, CurrentUserDocument, CreateReviewDocument } from '../../../generated/graphql';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const mocks = [
    {
        request: {
            query: AllMoviesDocument,
        },
        result: {
            data: {
                allMovies: {
                    nodes: [
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
                    ],
                },
            },
        },
    },
    {
        request: {
            query: CurrentUserDocument,
        },
        result: {
            data: {
                currentUser: {
                    id: 'user1',
                    name: 'Test User',
                },
            },
        },
    },
];

describe('Reviews Component', () => {
    it('renders loading state initially', () => {
        render(
            <MockedProvider mocks={[]} addTypename={false}>
                <Reviews />
            </MockedProvider>
        );
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders movies and reviews after loading', async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <ThemeProvider theme={theme}>
                    <Reviews />
                </ThemeProvider>
            </MockedProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Cool Movie')).toBeInTheDocument();
        });

        expect(screen.getByText('Great')).toBeInTheDocument();
        expect(screen.getByText('Loved it')).toBeInTheDocument();
    });

    it('opens review dialog when button is clicked', async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <ThemeProvider theme={theme}>
                    <Reviews />
                </ThemeProvider>
            </MockedProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Add Review')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Add Review'));

        await waitFor(() => {
            expect(screen.getByText('Write a Review')).toBeInTheDocument();
        });
    });
});
