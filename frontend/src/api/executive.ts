import axiosInstance from '../utils/axios';

export interface KPIMetrics {
  total_produced: {
    total_produced: number;
    top_type: Array<{
      count: number;
      type_name: string;
    }>;
  };
  average_rating: {
    average_rating: number;
  };
  top_genre: {
    genre_name: string;
    total_title: number;
    average_rating: number;
  };
}

export interface BestTitle {
  name: string;
  vote_average: number;
  vote_count: number;
}

export interface GenreTrend {
  genre_name: string;
  total_votes: number;
  start_year: number;
}

export interface SummaryTrendItem {
  production_year: number;
  total_production: number;
  avg_rating: number;
}

export interface TopCompany {
  production_company_type_id: string;
  production_company_name: string;
  jumlah_tayangan: number;
  avg_rating: number;
}

export const executiveAPI = {
  getKPIMetrics: async (companyID: string, year?: number): Promise<KPIMetrics> => {
    const url = year 
      ? `/dashboard/kpi?company_id=${companyID}&year=${year}`
      : `/dashboard/kpi?company_id=${companyID}`;
    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getBestTitles: async (companyID: string, top: number = 5, year?: number): Promise<BestTitle[]> => {
    const url = year
      ? `/dashboard/best-titles?company_id=${companyID}&top=${top}&year=${year}`
      : `/dashboard/best-titles?company_id=${companyID}&top=${top}`;
    const response = await axiosInstance.get(url);
    return response.data.data || [];
  },

  getGenreTrend: async (companyID: string): Promise<GenreTrend[]> => {
    const response = await axiosInstance.get(`/dashboard/genre-trend?company_id=${companyID}`);
    return response.data.data || [];
  },

  getSummaryTrend: async (companyID: string, yearRange: number = 5): Promise<SummaryTrendItem[]> => {
    const response = await axiosInstance.get(
      `/dashboard/summary-trend?company_id=${companyID}&year_range=${yearRange}`
    );
    return response.data.data || [];
  },

  getTopCompanies: async (top?: number): Promise<TopCompany[]> => {
    const url = top ? `/dashboard/top-companies?top=${top}` : `/dashboard/top-companies`;
    const response = await axiosInstance.get(url);
    return response.data.data || [];
  },

  getAvailableYears: async (companyID: string): Promise<number[]> => {
    const response = await axiosInstance.get(`/dashboard/available-years?company_id=${companyID}`);
    return response.data.data || [];
  },
};
