import React, { FC } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '../../../state';
import { actions } from '../state/slice';
import { useCurrentUserQuery } from '../../../generated/graphql';
import { Star } from 'lucide-react';

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

    const handleOpenChange = (open: boolean) => {
        if (!open) handleClose();
    };

    if (!selectedMovie) return null;

    return (
        <Dialog open={isViewReviewsOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-baseline gap-2">
                        {selectedMovie.title}
                        <span className="text-lg font-normal text-muted-foreground">Reviews</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
                    {selectedMovie.movieReviewsByMovieId.nodes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No reviews yet. Be the first to share your thoughts!
                        </div>
                    ) : (
                        selectedMovie.movieReviewsByMovieId.nodes.map((review) => {
                            if (!review) return null;
                            return (
                                <Card key={review.id} className="bg-muted/50 border-border/50">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-lg">{review.title}</h4>
                                            <div className="flex items-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= (review.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{review.body}</p>
                                        <div className="mt-4 flex justify-end">
                                            <span className="text-xs text-muted-foreground italic">
                                                — {review.userByUserReviewerId?.name || 'Anonymous'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={handleClose}>Close</Button>
                    <Button
                        onClick={handleWriteReview}
                        disabled={!currentUser}
                    >
                        {currentUser ? 'Write a Review' : 'Login to Review'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
