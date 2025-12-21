import axiosInstance from '../utils/axios';

export interface WatchlistItem {
  watchlist_id: number;
  user_id: number;
  title_id: string;
  title_name: string;
  vote_average?: number;
  created_at: string;
}

export interface AddToWatchlistRequest {
  title_id: string;
}

export const watchlistAPI = {
  // Get current user's watchlist
  getMyWatchlist: async (): Promise<WatchlistItem[]> => {
    const response = await axiosInstance.get('/watchlist');
    return response.data.data || [];
  },

  // Add title to watchlist
  addToWatchlist: async (titleId: string): Promise<WatchlistItem> => {
    const response = await axiosInstance.post('/watchlist', {
      title_id: titleId,
    });
    return response.data.data;
  },

  // Remove title from watchlist
  removeFromWatchlist: async (titleId: string): Promise<void> => {
    await axiosInstance.delete(`/watchlist/${titleId}`);
  },

  // Check if title is in watchlist
  isInWatchlist: async (titleId: string): Promise<boolean> => {
    const response = await axiosInstance.get(`/watchlist/check/${titleId}`);
    return response.data.data?.exists || false;
  },
};
