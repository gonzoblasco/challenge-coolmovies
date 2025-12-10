import React, { useEffect } from 'react';
import {
    Typography,
    Grid,
    Container,
    Skeleton,
    Box
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../state';
import { actions } from '../state/slice';
import { MovieCard } from '../components/MovieCard';
import { ReviewListDialog } from '../components/ReviewListDialog';
import { CreateReviewDialog } from '../components/CreateReviewDialog';

const Reviews = () => {
    const dispatch = useAppDispatch();
    const { movies, loading, error } = useAppSelector(state => state.reviews);

    useEffect(() => {
        dispatch(actions.fetchMovies());
    }, [dispatch]);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                Movie Reviews
            </Typography>

            {error && (
                <Typography color="error" align="center" gutterBottom>
                    Error: {error}
                </Typography>
            )}

            <Grid container spacing={4}>
                {loading && movies.length === 0 ? (
                    // Skeleton Loading State
                    Array.from(new Array(6)).map((_, index) => (
                        <Grid item key={`skeleton-${index}`} xs={12} md={6} lg={4}>
                            <Box sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                                <Skeleton variant="rectangular" height={400} animation="wave" />
                                <Box sx={{ p: 2 }}>
                                    <Skeleton width="80%" height={32} sx={{ mb: 1 }} />
                                    <Skeleton width="40%" height={20} sx={{ mb: 2 }} />
                                    <Skeleton width="60%" height={24} />
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                        <Skeleton width="100%" height={40} />
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    ))
                ) : (
                    movies.map((movie) => (
                        <Grid item key={movie.id} xs={12} md={6} lg={4}>
                            <MovieCard movie={movie} />
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Dialogs controlled by Redux state */}
            <ReviewListDialog />
            <CreateReviewDialog />
        </Container>
    );
};

export default Reviews;
