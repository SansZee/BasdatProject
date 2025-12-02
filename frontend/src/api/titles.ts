import axiosInstance from '../utils/axios';

export interface Title {
  title_id: string;
  name: string;
  start_year: number;
  vote_average: number;
  vote_count: number;
  genre_name: string;
}

export interface SearchTitle {
  title_id: string | null;
  name: string | null;
  overview: string | null;
  vote_average: number | null;
}

// Alias untuk backwards compatibility
export type TrendingTitle = Title;
export type TopRatedTitle = Title;

export interface TitleDetail {
  title_id: string | null;
  name: string | null;
  original_name: string | null;
  overview: string | null;
  popularity: number | null;
  vote_average: number | null;
  vote_count: number | null;
  runtime_minutes: number | null;
  start_year: number | null;
  end_year: number | null;
  number_of_seasons: number | null;
  number_of_episodes: number | null;
  type: string | null;
  status: string | null;
  tagline: string | null;
}

export interface TitleDetailResponse {
  detail: TitleDetail | null;
  genres: Array<{ genre_name: string | null }>;
  languages: Array<{ language_name: string | null }>;
  countries: Array<{ country_name: string | null }>;
  companies: Array<{ company_name: string | null }>;
  networks: Array<{ network_name: string | null }>;
  air_dates: Array<{
    date: string | null;
    is_first: boolean | null;
    season_number: number | null;
    episode_number: number | null;
  }>;
  cast_and_crew: Array<{
    ordering: number | null;
    person_name: string | null;
    job_category: string | null;
    characters: string | null;
  }>;
}

export const titlesAPI = {
  getTrendingTitles: async (limit: number = 6): Promise<Title[]> => {
    const response = await axiosInstance.get(`/titles/trending?limit=${limit}`);
    return response.data.data; // Backend wrap response dalam data field
  },

  getTopRatedTitles: async (limit: number = 6): Promise<Title[]> => {
    const response = await axiosInstance.get(`/titles/top-rated?limit=${limit}`);
    return response.data.data;
  },

  searchTitles: async (keyword: string): Promise<SearchTitle[]> => {
    const response = await axiosInstance.get(`/titles/search?q=${encodeURIComponent(keyword)}`);
    return response.data.data;
  },

  getTitleDetail: async (titleId: string): Promise<TitleDetailResponse> => {
    const response = await axiosInstance.get(`/titles/${titleId}/detail`);
    return response.data.data;
  },
};