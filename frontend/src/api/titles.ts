import axiosInstance from '../utils/axios';

export interface Title {
  title_id: string;
  name: string;
  start_year: number;
  vote_average: number;
  vote_count: number;
  genre_name: string;
}

// Alias untuk backwards compatibility
export type TrendingTitle = Title;
export type TopRatedTitle = Title;

export const titlesAPI = {
  getTrendingTitles: async (limit: number = 6): Promise<Title[]> => {
    const response = await axiosInstance.get(`/titles/trending?limit=${limit}`);
    return response.data.data; // Backend wrap response dalam data field
  },

  getTopRatedTitles: async (limit: number = 6): Promise<Title[]> => {
    const response = await axiosInstance.get(`/titles/top-rated?limit=${limit}`);
    return response.data.data;
  },
};