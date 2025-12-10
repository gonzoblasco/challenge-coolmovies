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

    const [writeReviewOpen, setWriteReviewOpen] = useState(false); // Modal for Writing
    const [viewReviewsOpen, setViewReviewsOpen] = useState(false); // Modal for Viewing
    const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
    const [rating, setRating] = useState<number | null>(0);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    const currentUser = userData?.currentUser;

    const handleOpenWrite = (movieId: string) => {
        setSelectedMovieId(movieId);
        setWriteReviewOpen(true);
    };

    const handleOpenView = (movieId: string) => {
        setSelectedMovieId(movieId);
        setViewReviewsOpen(true);
    };

    const handleClose = () => {
        setWriteReviewOpen(false);
        setViewReviewsOpen(false);
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

    // Helper to get selected movie for the dialogs
    const selectedMovie = moviesData?.allMovies?.nodes.find(m => m?.id === selectedMovieId);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                Movie Reviews
            </Typography>
            <Grid container spacing={4}>
                {moviesData?.allMovies?.nodes.map((movie) => {
                    if (!movie) return null; // Skip null movies
                    const reviews = movie.movieReviewsByMovieId.nodes;
                    const reviewCount = reviews.length;
                    const averageRating = reviewCount > 0
                        ? reviews.reduce((acc, review) => acc + (review?.rating || 0), 0) / reviewCount
                        : 0;

                    return (
                        <Grid item key={movie.id} xs={12} md={6} lg={4}>
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
                                    <Typography variant="h5" component="div" gutterBottom sx={{ lineHeight: 1.2 }}>
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
                                        onClick={() => handleOpenView(movie.id)}
                                    >
                                        View Reviews
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        color="primary"
                                        onClick={() => handleOpenWrite(movie.id)}
                                        disabled={!currentUser}
                                        sx={{ borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                    >
                                        {currentUser ? 'Write Review' : 'Login to Review'}
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* View Reviews Dialog */}
            <Dialog
                open={viewReviewsOpen}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                scroll="paper"
            >
                {selectedMovie && (
                    <>
                        <DialogTitle sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: '#eeeeee',
                            color: '#212121', // Dark text for contrast
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
                                onClick={() => { setViewReviewsOpen(false); setWriteReviewOpen(true); }}
                                disabled={!currentUser}
                            >
                                Write a Review
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Write Review Dialog */}
            <Dialog open={writeReviewOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Write a Review for {selectedMovie?.title}</DialogTitle>
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
                    <Button onClick={handleSubmit} variant="contained" disabled={!title || !body || !rating} size="large">
                        Submit Review
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Reviews;
