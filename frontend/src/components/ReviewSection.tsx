import { useState, useEffect } from 'react';
import { Trash2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI, Review } from '../api/reviews';

interface ReviewSectionProps {
    titleId: string;
}

export function ReviewSection({ titleId }: ReviewSectionProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [rating, setRating] = useState(8);
    const [reviewText, setReviewText] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setError(null);
                const data = await reviewsAPI.getReviews(titleId);
                setReviews(data);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
                setError('Failed to load reviews');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [titleId]);

    // Handle submit review
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError('Please login to submit a review');
            return;
        }

        if (!reviewText.trim()) {
            setError('Please enter a review');
            return;
        }

        setIsSubmitting(true);
        try {
            setError(null);
            const newReview = await reviewsAPI.createReview(titleId, {
                rating,
                review_text: reviewText,
            });

            // Update review list - if user already had a review, replace it; otherwise add new
            const existingReviewIndex = reviews.findIndex(r => r.user_id === user.user_id);
            if (existingReviewIndex >= 0) {
                const updatedReviews = [...reviews];
                updatedReviews[existingReviewIndex] = {
                    review_id: newReview.review_id,
                    user_id: user.user_id,
                    username: user.username,
                    title_id: titleId,
                    rating: newReview.rating,
                    review_text: newReview.review_text,
                    created_at: newReview.created_at,
                    updated_at: newReview.updated_at,
                };
                setReviews(updatedReviews);
            } else {
                setReviews([
                    {
                        review_id: newReview.review_id,
                        user_id: user.user_id,
                        username: user.username,
                        title_id: titleId,
                        rating: newReview.rating,
                        review_text: newReview.review_text,
                        created_at: newReview.created_at,
                        updated_at: newReview.updated_at,
                    },
                    ...reviews,
                ]);
            }

            // Clear form
            setRating(8);
            setReviewText('');
        } catch (err) {
            console.error('Failed to submit review:', err);
            setError('Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete review
    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            setError(null);
            await reviewsAPI.deleteReview(reviewId);
            setReviews(reviews.filter(r => r.review_id !== reviewId));
        } catch (err) {
            console.error('Failed to delete review:', err);
            setError('Failed to delete review');
        }
    };

    return (
        <section className="mb-16">
            <h2 className="text-light text-2xl font-bold mb-8">Reviews</h2>

            {error && (
                <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Review Form */}
            {user ? (
                <form onSubmit={handleSubmitReview} className="bg-secondary border-2 border-accent/30 rounded-lg p-6 mb-8">
                    <h3 className="text-light text-lg font-bold mb-4">
                        Write a Review
                    </h3>

                    {/* Rating Input */}
                    <div className="mb-6">
                        <label className="text-light font-semibold mb-3 block">
                            Rating
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    onMouseEnter={() => setHoverRating(num)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                                        num <= (hoverRating || rating)
                                            ? 'bg-accent text-primary'
                                            : 'bg-primary border-2 border-gray-600 text-light hover:border-accent'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review Text Input */}
                    <div className="mb-6">
                        <label className="text-light font-semibold mb-3 block">
                            Your Review
                        </label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your thoughts about this title..."
                            className="w-full bg-primary border-2 border-gray-600 text-light rounded-lg p-4 focus:border-accent focus:outline-none transition-colors resize-none"
                            rows={4}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !reviewText.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-primary font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                        <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                    </button>
                </form>
            ) : (
                <div className="bg-secondary/50 border-2 border-accent/30 rounded-lg p-6 mb-8">
                    <p className="text-gray-400">
                        Please{' '}
                        <a href="/login" className="text-accent hover:underline">
                            login
                        </a>
                        {' '}to write a review.
                    </p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">Loading reviews...</p>
                    </div>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div
                            key={review.review_id}
                            className="bg-secondary border border-gray-600 rounded-lg p-6 hover:border-accent/50 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-accent font-semibold text-lg">
                                        {review.rating}/10
                                    </span>
                                    <span className="text-gray-400 text-sm">by {review.username}</span>
                                </div>

                                {user && user.user_id === review.user_id && (
                                    <button
                                        onClick={() => handleDeleteReview(review.review_id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Delete review"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>

                            <p className="text-light mb-3">
                                {review.review_text}
                            </p>

                            <p className="text-gray-400 text-sm">
                                {new Date(review.created_at).toLocaleDateString()} •{' '}
                                {new Date(review.created_at).toLocaleTimeString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 bg-secondary/50 rounded-lg">
                        <p className="text-gray-400">
                            No reviews yet. Be the first to review!
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
