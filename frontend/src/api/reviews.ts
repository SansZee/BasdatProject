import axiosInstance from '../utils/axios';

// Type definitions
// SP-based query returns: review_id, title_id, title_name, rating, review_text, created_at, updated_at
// Direct SQL queries also return: user_id, username (optional fields)
export interface Review {
  review_id: number;
  user_id?: number;
  username?: string;
  title_id: string;
  title_name?: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewRequest {
  title_id: string;
  rating: number;
  review_text: string;
}

export interface ReviewResponse {
  review_id: number;
  user_id?: number;
  username?: string;
  title_id: string;
  title_name?: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

// API calls
export const reviewsAPI = {
  // Get all reviews for a title
  getReviews: async (titleId: string): Promise<Review[]> => {
    const response = await axiosInstance.get(`/reviews/${titleId}`);
    return response.data.data || [];
  },

  // Create or update review for a title
  createReview: async (titleId: string, data: { rating: number; review_text: string }): Promise<ReviewResponse> => {
    const response = await axiosInstance.post('/reviews', {
      title_id: titleId,
      rating: data.rating,
      review_text: data.review_text,
    });
    return response.data.data;
  },

  // Get all reviews written by current user
  getUserReviews: async (): Promise<Review[]> => {
    const response = await axiosInstance.get('/reviews/user');
    return response.data.data || [];
  },

  // Check if user has reviewed a specific title
  getUserReviewForTitle: async (titleId: string): Promise<Review | null> => {
    const response = await axiosInstance.get(`/reviews/check/${titleId}`);
    return response.data.data;
  },

  // Delete a review by ID
  deleteReview: async (reviewId: number): Promise<void> => {
    await axiosInstance.delete(`/reviews/${reviewId}`);
  },
};
