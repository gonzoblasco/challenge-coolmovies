import React, { FC } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Button,
    Rating
} from '@mui/material';
import { Movie } from '../../../generated/graphql';
import { useAppDispatch, useAppSelector } from '../../../state'; // Assuming hooks are here, checking store.ts exports
import { actions } from '../state/slice';
import { useCurrentUserQuery } from '../../../generated/graphql';

interface MovieCardProps {
    movie: Movie;
}

export const MovieCard: FC<MovieCardProps> = ({ movie }) => {
    const dispatch = useAppDispatch();
    const { data: userData } = useCurrentUserQuery();
    const currentUser = userData?.currentUser;

    const reviews = movie.movieReviewsByMovieId.nodes;
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
        ? reviews.reduce((acc, review) => acc + (review?.rating || 0), 0) / reviewCount
        : 0;

    const handleViewReviews = () => {
        dispatch(actions.openViewReviews(movie.id));
    };

    const handleWriteReview = () => {
        dispatch(actions.openWriteReview(movie.id));
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(98, 0, 234, 0.15)',
                },
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.05)',
                bgcolor: 'background.paper'
            }}
        >
            <Box sx={{ position: 'relative', height: 400 }}>
                <CardMedia
                    component="img"
                    height="100%"
                    image={movie.imgUrl}
                    alt={movie.title}
                    sx={{ objectFit: 'cover' }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(15,15,19,1) 0%, rgba(15,15,19,0) 100%)',
                        height: '50%',
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1, pt: 2 }}>
                <Typography variant="h5" component="div" gutterBottom sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                    {movie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Released: {new Date(movie.releaseDate).toLocaleDateString()}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                    <Rating value={averageRating} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({reviewCount} reviews)
                    </Typography>
                </Box>
            </CardContent>

            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                    variant="contained"
                    fullWidth
                    color="primary"
                    onClick={handleViewReviews}
                >
                    View Reviews
                </Button>
                <Button
                    variant="outlined"
                    fullWidth
                    color="primary"
                    onClick={handleWriteReview}
                    disabled={!currentUser}
                    sx={{ borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                >
                    {currentUser ? 'Write Review' : 'Login to Review'}
                </Button>
            </Box>
        </Card>
    );
};
