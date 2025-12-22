import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewsAPI, Review } from '../api/reviews';
import { Star, Calendar, MessageCircle, ChevronRight } from 'lucide-react';

interface ReviewPanelProps {
  userId: number;
}

export function ReviewPanel({ userId }: ReviewPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hide reviews section for users 2 and 3
  if (user && (user.user_id === 2 || user.user_id === 3)) {
    return null;
  }

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setError(null);
        console.log('ReviewPanel: Fetching reviews for userId:', userId);
        const data = await reviewsAPI.getUserReviews();
        console.log('ReviewPanel: Reviews data received:', data);
        console.log('ReviewPanel: Total reviews:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('ReviewPanel: First review:', data[0]);
        }
        setReviews(data);
      } catch (err) {
        console.error('ReviewPanel: Failed to fetch reviews:', err);
        setError('Failed to load your reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  // Refetch reviews when returning to profile page
  useEffect(() => {
    const handleFocus = () => {
      console.log('ReviewPanel: Window focus event - refetching reviews');
      const fetchReviews = async () => {
        try {
          setError(null);
          const data = await reviewsAPI.getUserReviews();
          console.log('ReviewPanel: Refetched reviews on focus:', data);
          setReviews(data);
        } catch (err) {
          console.error('ReviewPanel: Failed to refetch reviews on focus:', err);
        }
      };
      fetchReviews();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleReviewClick = (review: Review) => {
    navigate(`/titles/${review.title_id}`, { state: { scrollToReviews: true } });
  };

  const handleDeleteReview = async (reviewId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewsAPI.deleteReview(reviewId);
      setReviews(reviews.filter(r => r.review_id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-light text-2xl font-bold mb-6">My Reviews</h2>
        <div className="text-center py-8">
          <p className="text-gray-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-light text-2xl font-bold">My Reviews</h2>
        <span className="px-3 py-1 bg-accent/20 text-accent font-semibold text-sm rounded-lg">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.review_id}
              onClick={() => handleReviewClick(review)}
              className="bg-secondary border border-secondary hover:border-accent transition-colors rounded-lg p-4 cursor-pointer group"
            >
              {/* Header with title and rating */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-light font-bold text-sm group-hover:text-accent transition-colors line-clamp-2 flex-1">
                  {review.title_name || 'Unknown Title'}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="fill-accent text-accent" size={14} />
                  <span className="text-accent font-bold text-sm">{review.rating}</span>
                </div>
              </div>

              {/* Review text */}
              <p className="text-gray-300 text-xs line-clamp-2 mb-3">
                {review.review_text || 'No text provided'}
              </p>

              {/* Meta information */}
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Footer with action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-secondary/50 gap-2">
                <button
                  onClick={() => handleReviewClick(review)}
                  className="flex items-center gap-1 text-accent hover:text-accent/80 font-semibold text-xs transition-colors"
                >
                  <span>View</span>
                  <ChevronRight size={12} />
                </button>

                <button
                  onClick={(e) => handleDeleteReview(review.review_id, e)}
                  className="px-2 py-1 text-red-400 hover:bg-red-500/20 rounded text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-secondary/50 rounded-lg">
          <MessageCircle className="mx-auto text-gray-500 mb-3" size={32} />
          <p className="text-gray-400 text-sm mb-3">You haven't written any reviews yet</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm bg-accent text-primary font-semibold rounded hover:bg-accent/90 transition-colors"
          >
            Explore Titles
          </button>
        </div>
      )}
    </div>
  );
}
