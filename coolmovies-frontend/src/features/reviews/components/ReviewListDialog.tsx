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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '../../../state';
import { actions } from '../state/slice';
import { useCurrentUserQuery, useUpdateReviewMutation, useMovieReviewsQuery } from '../../../generated/graphql';
import { Star, Pencil, Check, X } from 'lucide-react';
import { useState } from 'react';

export const ReviewListDialog: FC = () => {
    const dispatch = useAppDispatch();
    const { movies, selectedMovieId, isViewReviewsOpen } = useAppSelector(state => state.reviews);
    const { data: userData } = useCurrentUserQuery();
    const { data: reviewsData, loading: reviewsLoading, error: reviewsError } = useMovieReviewsQuery({
        variables: { id: selectedMovieId as any },
        skip: !selectedMovieId
    });
    const [updateReview] = useUpdateReviewMutation();
    const currentUser = userData?.currentUser;

    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', body: '', rating: 5 });

    const startEdit = (review: any) => {
        setEditingReviewId(review.id);
        setEditForm({
            title: review.title || '',
            body: review.body || '',
            rating: review.rating || 5
        });
    };

    const cancelEdit = () => {
        setEditingReviewId(null);
        setEditForm({ title: '', body: '', rating: 5 });
    };

    const saveEdit = async () => {
        if (!editingReviewId) return;

        try {
            await updateReview({
                variables: {
                    id: editingReviewId,
                    patch: {
                        title: editForm.title,
                        body: editForm.body,
                        rating: editForm.rating
                    }
                },
                optimisticResponse: {
                    updateMovieReviewById: {
                        __typename: 'UpdateMovieReviewPayload',
                        movieReview: {
                            __typename: 'MovieReview',
                            id: editingReviewId,
                            title: editForm.title,
                            body: editForm.body,
                            rating: editForm.rating,
                        }
                    }
                }
            });
            setEditingReviewId(null);
        } catch (error) {
            console.error('Failed to update review:', error);
        }
    };

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
                    {reviewsLoading ? (
                        <div className="flex justify-center items-center h-full">Loading reviews...</div>
                    ) : !reviewsData?.movieById?.movieReviewsByMovieId?.nodes || reviewsData.movieById.movieReviewsByMovieId.nodes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No reviews yet. Be the first to share your thoughts!
                        </div>
                    ) : (
                        reviewsData.movieById.movieReviewsByMovieId.nodes.map((review) => {
                            if (!review) return null;
                            const isEditing = editingReviewId === review.id;
                            const isOwner = currentUser && review.userReviewerId === currentUser.id;

                            return (
                                <Card key={review.id} className="bg-muted/50 border-border/50">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start gap-4">
                                            {isEditing ? (
                                                <div className="flex-1 space-y-2">
                                                    <Input
                                                        value={editForm.title}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                        placeholder="Review Title"
                                                        className="font-semibold text-lg h-auto py-1 px-2"
                                                    />
                                                </div>
                                            ) : (
                                                <h4 className="font-semibold text-lg flex-1">{review.title}</h4>
                                            )}

                                            <div className="flex items-center gap-4">
                                                {isEditing ? (
                                                    <div className="flex items-center">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setEditForm(prev => ({ ...prev, rating: star }))}
                                                                className="focus:outline-none transition-transform hover:scale-110"
                                                            >
                                                                <Star
                                                                    className={`w-4 h-4 ${star <= editForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`w-4 h-4 ${star <= (review.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                {isOwner && !isEditing && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        onClick={() => startEdit(review)}
                                                        aria-label="Edit review"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <Textarea
                                                    value={editForm.body}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                                                    placeholder="Write your review here..."
                                                    className="min-h-[100px] text-sm"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={cancelEdit}
                                                        className="h-8 w-8 p-0"
                                                        aria-label="Cancel edit"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={saveEdit}
                                                        className="h-8 w-8 p-0"
                                                        disabled={!editForm.title || !editForm.body}
                                                        aria-label="Save review"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{review.body}</p>
                                                <div className="mt-4 flex justify-end">
                                                    <span className="text-xs text-muted-foreground italic">
                                                        — {review.userByUserReviewerId?.name || 'Anonymous'}
                                                    </span>
                                                </div>
                                            </>
                                        )}
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
