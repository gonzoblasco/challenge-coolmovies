import React, { FC, useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Rating,
    Box,
    Typography
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../state';
import { actions } from '../state/slice';
import { useCurrentUserQuery } from '../../../generated/graphql';

export const CreateReviewDialog: FC = () => {
    const dispatch = useAppDispatch();
    const { movies, selectedMovieId, isWriteReviewOpen, loading } = useAppSelector(state => state.reviews);
    const { data: userData } = useCurrentUserQuery();
    const currentUser = userData?.currentUser;
    const selectedMovie = movies.find(m => m.id === selectedMovieId);

    const [rating, setRating] = useState<number | null>(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    // Reset form when dialog opens
    useEffect(() => {
        if (isWriteReviewOpen) {
            setRating(0);
            setTitle('');
            setBody('');
        }
    }, [isWriteReviewOpen]);

    const handleClose = () => {
        dispatch(actions.closeWriteReview());
    };

    const handleSubmit = () => {
        if (!selectedMovieId || !currentUser || !rating) return;

        dispatch(actions.createReview({
            title,
            body,
            rating,
            movieId: selectedMovieId,
            userId: currentUser.id
        }));
    };

    if (!selectedMovie) return null;

    return (
        <Dialog open={isWriteReviewOpen} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Write a Review for {selectedMovie.title}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        autoFocus
                        label="Title"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Box>
                        <Typography component="legend">Rating</Typography>
                        <Rating
                            name="simple-controlled"
                            value={rating}
                            size="large"
                            onChange={(event, newValue) => {
                                setRating(newValue);
                            }}
                        />
                    </Box>
                    <TextField
                        label="Review"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Tell us what you thought about the movie..."
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!title || !body || !rating || loading}
                    size="large"
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
