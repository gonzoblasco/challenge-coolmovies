import React, { useState } from 'react';
import {
    Typography,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    Box,
    Container,
} from '@mui/material';
import {
    useAllMoviesQuery,
    useCreateReviewMutation,
    useCurrentUserQuery,
} from '../../../generated/graphql';

const Reviews = () => {
    const { data: moviesData, loading, error } = useAllMoviesQuery();
    const { data: userData } = useCurrentUserQuery();
    const [createReview] = useCreateReviewMutation();

    const [open, setOpen] = useState(false);
    const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
    const [rating, setRating] = useState<number | null>(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    const currentUser = userData?.currentUser;

    const handleOpen = (movieId: string) => {
        setSelectedMovieId(movieId);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedMovieId(null);
        setRating(0);
        setTitle('');
        setBody('');
    };

    const handleSubmit = async () => {
        if (!selectedMovieId || !currentUser || !rating) return;

        try {
            await createReview({
                variables: {
                    title,
                    body,
                    rating,
                    movieId: selectedMovieId,
                    userId: currentUser.id,
                },
                refetchQueries: ['AllMovies'],
            });
            handleClose();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography>Error: {error.message}</Typography>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4 }}>
                Movie Reviews
            </Typography>
            <Grid container spacing={4}>
                {moviesData?.allMovies?.nodes.map((movie) => (
                    <Grid item key={movie.id} xs={12} md={6} lg={4}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                },
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="300"
                                image={movie.imgUrl}
                                alt={movie.title}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div" gutterBottom>
                                    {movie.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Released: {new Date(movie.releaseDate).toLocaleDateString()}
                                </Typography>

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h6">Reviews</Typography>
                                    {movie.movieReviewsByMovieId.nodes.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            No reviews yet.
                                        </Typography>
                                    ) : (
                                        movie.movieReviewsByMovieId.nodes.map((review) => (
                                            <Box key={review.id} sx={{ mt: 1, mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                                                <Typography variant="subtitle2" component="span" fontWeight="bold">
                                                    {review.title}
                                                </Typography>
                                                {' - '}
                                                <Rating value={review.rating} readOnly size="small" />
                                                <Typography variant="body2">
                                                    {review.body}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    By {review.userByUserReviewerId?.name || 'Unknown'}
                                                </Typography>
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            </CardContent>
                            <Box sx={{ p: 2 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => handleOpen(movie.id)}
                                    disabled={!currentUser}
                                >
                                    {currentUser ? 'Add Review' : 'Login to Review'}
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Review"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                    <Box sx={{ mt: 2 }}>
                        <Typography component="legend">Rating</Typography>
                        <Rating
                            name="simple-controlled"
                            value={rating}
                            onChange={(event, newValue) => {
                                setRating(newValue);
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!title || !body || !rating}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Reviews;
