import React, { FC } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Card,
    Rating
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../state';
import { actions } from '../state/slice';
import { useCurrentUserQuery } from '../../../generated/graphql';

export const ReviewListDialog: FC = () => {
    const dispatch = useAppDispatch();
    const { movies, selectedMovieId, isViewReviewsOpen } = useAppSelector(state => state.reviews);
    const { data: userData } = useCurrentUserQuery();
    const currentUser = userData?.currentUser;

    const selectedMovie = movies.find(m => m.id === selectedMovieId);

    const handleClose = () => {
        dispatch(actions.closeViewReviews());
    };

    const handleWriteReview = () => {
        dispatch(actions.closeViewReviews());
        if (selectedMovieId) {
            dispatch(actions.openWriteReview(selectedMovieId));
        }
    };

    if (!selectedMovie) return null;

    return (
        <Dialog
            open={isViewReviewsOpen}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#eeeeee',
                color: '#212121',
                borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}>
                <Box>
                    <Typography variant="h4" component="span" sx={{ fontWeight: 700, color: '#212121' }}>
                        {selectedMovie.title}
                    </Typography>
                    <Typography variant="h5" component="span" color="primary.main" sx={{ ml: 2, fontWeight: 300 }}>
                        Reviews
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {selectedMovie.movieReviewsByMovieId.nodes.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No reviews yet. Be the first!</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {selectedMovie.movieReviewsByMovieId.nodes.map((review) => {
                            if (!review) return null;
                            return (
                                <Grid item xs={12} key={review.id}>
                                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                                {review.title}
                                            </Typography>
                                            <Rating value={review.rating || 0} readOnly size="small" />
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                                            "{review.body}"
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                — {review.userByUserReviewerId?.name || 'Unknown User'}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </Grid>
                            )
                        })}
                    </Grid>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={handleClose} color="inherit">Close</Button>
                <Button
                    variant="contained"
                    onClick={handleWriteReview}
                    disabled={!currentUser}
                >
                    Write a Review
                </Button>
            </DialogActions>
        </Dialog>
    );
};
