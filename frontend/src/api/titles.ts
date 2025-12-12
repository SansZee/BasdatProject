import axiosInstance from '../utils/axios';

export interface Title {
  title_id: string;
  name: string;
  start_year: number;
  vote_average: number;
  vote_count: number;
  genre_name: string;
}

export interface FilmCardData {
  title_id: string;
  name: string;
  start_year: number;
  vote_average: number;
  vote_count: number;
  genre_name: string;
}

// Aliases untuk backwards compatibility
export type SearchTitle = FilmCardData;
export type TrendingTitle = FilmCardData;
export type TopRatedTitle = FilmCardData;

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

 export interface FilteredTitle {
   title_id: string;
   name: string;
   number_of_seasons: number | null;
   number_of_episodes: number | null;
   overview: string | null;
   adult: boolean | null;
   in_production: boolean | null;
   original_name: string | null;
   popularity: number | null;
   tagline: string | null;
   runtime_minutes: number | null;
   type_id: string | null;
   status_id: string | null;
   vote_count: number | null;
   vote_average: number | null;
   start_year: number | null;
   end_year: number | null;
 }

 export interface FilterRequest {
     genreIds?: string[] | undefined;
     typeIds?: string[] | undefined;
     statusIds?: string[] | undefined;
     originCountryIds?: string[] | undefined;
     productionCountryIds?: string[] | undefined;
     year?: number | undefined;
     sortBy: string;
     page: number;
     limit: number;
   }

 export interface FilterResponse {
   success: boolean;
   data: FilmCardData[];
   count: number;
 }

export interface FilterOption {
  genre_type_id?: string;
  genre_name?: string;
  type_id?: string;
  type_name?: string;
  status_id?: string;
  status_name?: string;
}

export interface FilterOptionsResponse {
  genres: Array<{ genre_type_id: string; genre_name: string }>;
  types: Array<{ type_id: string; type_name: string }>;
  statuses: Array<{ status_id: string; status_name: string }>;
  years: number[];
}

export const titlesAPI = {
   getFilterOptions: async (): Promise<FilterOptionsResponse> => {
     const response = await axiosInstance.get(`/titles/filter-options`);
     return response.data.data;
   },

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
     console.log('🌐 API Call: GET /titles/${titleId}/detail');
     const response = await axiosInstance.get(`/titles/${titleId}/detail`);
     console.log('🌐 Raw response:', response);
     console.log('🌐 response.data:', response.data);
     console.log('🌐 response.data.data:', response.data.data);
     const result = response.data.data;
     if (!result) {
       console.warn('⚠️ API returned no data');
     }
     return result;
   },

  filterTitles: async (filters: FilterRequest): Promise<FilterResponse> => {
    const response = await axiosInstance.post(`/titles/filter`, filters);
    return response.data;
  },
  };