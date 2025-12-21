import axiosInstance from '../utils/axios';

export interface ArtistCard {
  person_id: string;
  primary_name: string;
  birth_year: number | null;
  death_year: number | null;
  total_titles?: number;
  total_votes?: number;
  avg_rating?: number;
}

export interface ArtistTitle {
  title_id: string;
  name: string;
  type_id: string;
  start_year: number | null;
  end_year: number | null;
  poster_url: string | null;
  category: string;
  job: string | null;
  characters: string | null;
}

export interface ArtistDetail {
  person_id: string;
  primary_name: string;
  birth_year: number | null;
  death_year: number | null;
  professions: string[];
  known_for: Array<{
    title_id: string;
    name: string;
    start_year: number;
    vote_average: number;
    vote_count: number;
    genre_name: string;
  }>;
  all_titles: ArtistTitle[];
  total_titles: number;
}

export const artistsAPI = {
  searchArtists: async (keyword: string, limit: number = 20): Promise<ArtistCard[]> => {
    const response = await axiosInstance.get(`/artists/search?q=${encodeURIComponent(keyword)}&limit=${limit}`);
    return response.data.data;
  },

  getArtistDetail: async (personId: string): Promise<ArtistDetail> => {
    const response = await axiosInstance.get(`/artists/${personId}/detail`);
    return response.data.data;
  },
};
