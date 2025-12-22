import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Status Distribution (Pie Chart)
export const getStatusDistribution = (companyId?: string) => {
  const params = companyId ? { companyId } : {};
  return api.get('/api/production-dashboard/status-distribution', { params });
};

// In Production Details (Table)
export const getInProductionDetails = (companyId?: string) => {
  const params = companyId ? { companyId } : {};
  return api.get('/api/production-dashboard/in-production', { params });
};

// Planned Projects (Table)
export const getPlannedProjects = (companyId?: string) => {
  const params = companyId ? { companyId } : {};
  return api.get('/api/production-dashboard/planned-projects', { params });
};

// Top Production Companies (Bar Chart)
export const getTopProductionCompanies = (topN = 10) => {
  return api.get('/api/production-dashboard/top-companies', { params: { topN } });
};

// Genre Distribution (Bar Chart)
export const getGenreDistribution = (companyId?: string) => {
  const params = companyId ? { companyId } : {};
  return api.get('/api/production-dashboard/genre-distribution', { params });
};

// Top Cast (Table)
export const getTopCast = (topN = 20) => {
  return api.get('/api/production-dashboard/top-cast', { params: { topN } });
};

// Dashboard Summary (KPIs)
export const getDashboardSummary = (companyId?: string) => {
  const params = companyId ? { companyId } : {};
  return api.get('/api/production-dashboard/summary', { params });
};

// Titles by Status (Table)
export const getTitlesByStatus = (statusId: string, companyId?: string) => {
  const params: Record<string, string> = { statusId };
  if (companyId) params.companyId = companyId;
  return api.get('/api/production-dashboard/titles-by-status', { params });
};
