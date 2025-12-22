import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/shared/Navigation';
import ProductionStatusChart from '../components/charts/ProductionStatusChart';
import ProductionTopCompaniesChart from '../components/charts/ProductionTopCompaniesChart';
import ProductionGenreChart from '../components/charts/ProductionGenreChart';
import {
  ProductionInProductionTable,
  ProductionPlannedTable,
  ProductionCastTable,
} from '../components/charts/ProductionTables';
import {
  getStatusDistribution,
  getInProductionDetails,
  getPlannedProjects,
  getTopProductionCompanies,
  getGenreDistribution,
  getTopCast,
  getDashboardSummary,
  getTitlesByStatus,
} from '../api/production_dashboard';

const COMPANY_ID = '11454'; // Warner Bros

interface KPIData {
  total_in_production: number;
  total_planned: number;
  total_pilots: number;
  total_returning_series: number;
  total_canceled: number;
  total_popularity: number;
  top_company: string;
}

interface StatusData {
  status_id: string;
  status_name: string;
  total_titles: number;
}

interface CompanyData {
  company_id: string;
  company_name: string;
  total_titles: number;
  in_production_count: number;
  planned_count: number;
  avg_rating: number;
}

interface GenreData {
  genre_name: string;
  total_titles: number;
  total_popularity: number;
}

interface ProductionData {
  title_id: string;
  title_name: string;
  genres: string;
  production_companies: string;
  cast_count: number;
  rating: number;
  runtime_minutes: number;
  popularity: number;
  vote_count: number;
}

interface PlannedData {
  title_id: string;
  title_name: string;
  overview: string;
  genres: string;
  production_companies: string;
  start_year: number;
  planned_cast_count: number;
}

interface CastData {
  person_id: string;
  person_name: string;
  professions: string;
  total_projects: number;
  in_production_projects: number;
  avg_rating: number;
  projects: string;
}

interface TitleByStatus {
  title_id: string;
  title_name: string;
  status_name: string;
  genres: string;
  production_companies: string;
  cast_count: number;
  rating: number;
  popularity: number;
  runtime_minutes: number;
  number_of_seasons: number | null;
  number_of_episodes: number | null;
}

export function ProductionDashboard() {
  const [selectedStatus, setSelectedStatus] = useState<{ id: string; name: string } | null>(null);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData[]>([]);
  const [genreData, setGenreData] = useState<GenreData[]>([]);
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [plannedData, setPlannedData] = useState<PlannedData[]>([]);
  const [castData, setCastData] = useState<CastData[]>([]);
  const [statusFilteredData, setStatusFilteredData] = useState<TitleByStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedStatus) {
      fetchStatusFilteredData();
    }
  }, [selectedStatus]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        getDashboardSummary(COMPANY_ID),
        getStatusDistribution(COMPANY_ID),
        getTopProductionCompanies(10),
        getGenreDistribution(COMPANY_ID),
        getInProductionDetails(COMPANY_ID),
        getPlannedProjects(COMPANY_ID),
        getTopCast(15),
      ]);

      const [summary, status, companies, genres, production, planned, cast] = results;

      if (summary.status === 'fulfilled') setKpiData(summary.value.data);
      if (status.status === 'fulfilled') setStatusData(status.value.data || []);
      if (companies.status === 'fulfilled') setCompanyData(companies.value.data || []);
      if (genres.status === 'fulfilled') setGenreData(genres.value.data || []);
      if (production.status === 'fulfilled') setProductionData(production.value.data || []);
      if (planned.status === 'fulfilled') setPlannedData(planned.value.data || []);
      if (cast.status === 'fulfilled') setCastData(cast.value.data || []);

      // Log failed requests
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const endpoints = ['summary', 'status', 'companies', 'genres', 'production', 'planned', 'cast'];
          console.error(`Failed to load ${endpoints[index]}:`, result.reason);
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusFilteredData = async () => {
    if (!selectedStatus) return;

    try {
      const response = await getTitlesByStatus(selectedStatus.id, COMPANY_ID);
      setStatusFilteredData(response.data || []);
    } catch (err) {
      console.error('Error fetching status filtered data:', err);
    }
  };

  const handleStatusClick = (statusId: string, statusName: string) => {
    setSelectedStatus({ id: statusId, name: statusName });
  };

  const clearStatusFilter = () => {
    setSelectedStatus(null);
    setStatusFilteredData([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-4"></div>
            </div>
            <p className="text-gray-400">Loading Production Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary">
        <Navigation />
        <div className="max-w-[1600px] mx-auto px-8 py-16">
          <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-6">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-secondary via-secondary to-primary py-16 border-b border-accent/20">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="mb-8">
            <h1 className="text-light text-7xl font-bold mb-3">
              Warner Bros.
            </h1>
            <p className="text-accent text-xl font-semibold">
              Production Status & Content Management
            </p>
          </div>
          <div className="flex items-center gap-4 text-light/60 text-sm">
            <span>Real-time Production Tracking</span>
            <span>•</span>
            <span>Title Status Monitoring</span>
            <span>•</span>
            <span>Genre & Cast Analytics</span>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-light text-3xl font-bold mb-2">
            Production Overview
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-1 bg-gradient-to-r from-accent to-accent/30"></div>
            <p className="text-light/60">Current portfolio and production metrics</p>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <p className="text-light/60 text-sm font-medium mb-2">Currently In Production</p>
            <p className="text-4xl font-bold text-accent mb-2">{kpiData?.total_in_production || 0}</p>
            <p className="text-light/40 text-xs">Active titles</p>
          </div>

          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <p className="text-light/60 text-sm font-medium mb-2">Planned for Future</p>
            <p className="text-4xl font-bold text-accent mb-2">{kpiData?.total_planned || 0}</p>
            <p className="text-light/40 text-xs">Upcoming projects</p>
          </div>

          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <p className="text-light/60 text-sm font-medium mb-2">Pilot Episodes</p>
            <p className="text-4xl font-bold text-accent mb-2">{kpiData?.total_pilots || 0}</p>
            <p className="text-light/40 text-xs">In testing phase</p>
          </div>

          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <p className="text-light/60 text-sm font-medium mb-2">Canceled/Inactive</p>
            <p className="text-4xl font-bold text-red-500 mb-2">{kpiData?.total_canceled || 0}</p>
            <p className="text-light/40 text-xs">No longer active</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-light text-3xl font-bold mb-2">
            Production Analytics
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-1 bg-gradient-to-r from-accent to-accent/30"></div>
            <p className="text-light/60">Detailed production and content insights</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Status Distribution */}
          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <h3 className="text-light text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-accent">📊</span>
              Status Distribution
            </h3>
            <ProductionStatusChart data={statusData} onStatusClick={handleStatusClick} />
          </div>

          {/* Top Companies */}
          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <h3 className="text-light text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-accent">🏆</span>
              Top Production Companies
            </h3>
            <ProductionTopCompaniesChart data={companyData} />
          </div>
        </div>

        {/* Genre Distribution - Full Width */}
        <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors mb-8">
          <h3 className="text-light text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-accent">🎬</span>
            Genre Distribution
          </h3>
          <ProductionGenreChart data={genreData} />
        </div>
      </div>

      {/* Status Filter Section */}
      {selectedStatus && (
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="mb-8 p-6 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-light font-semibold text-lg">Warner Bros - {selectedStatus.name}</p>
              <p className="text-light/60 text-sm mt-1">Showing {statusFilteredData.length} titles in {selectedStatus.name.toLowerCase()} status</p>
            </div>
            <button
              onClick={clearStatusFilter}
              className="px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-medium"
            >
              Clear Filter
            </button>
          </div>

          {statusFilteredData.length > 0 && (
            <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
              <h3 className="text-light text-xl font-bold mb-6">
                {selectedStatus.name} Titles ({statusFilteredData.length})
              </h3>
              <ProductionInProductionTable data={statusFilteredData.slice(0, 10)} />
            </div>
          )}
        </div>
      )}

      {/* Tables Section - Show when no status filter */}
      {!selectedStatus && (
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          {/* Section Title */}
          <div className="mb-8">
            <h2 className="text-light text-3xl font-bold mb-2">
              Content Details
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-12 h-1 bg-gradient-to-r from-accent to-accent/30"></div>
              <p className="text-light/60">Detailed title information and cast</p>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* In Production */}
            <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
              <h3 className="text-light text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-accent">📹</span>
                Currently In Production ({productionData.length})
              </h3>
              <ProductionInProductionTable data={productionData.slice(0, 5)} />
            </div>

            {/* Planned Projects */}
            <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
              <h3 className="text-light text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-accent">🎯</span>
                Upcoming Projects ({plannedData.length})
              </h3>
              <ProductionPlannedTable data={plannedData.slice(0, 5)} />
            </div>
          </div>

          {/* Top Cast - Full Width */}
          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <h3 className="text-light text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-accent">⭐</span>
              Top Creators ({castData.length})
            </h3>
            <ProductionCastTable data={castData} />
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className="bg-secondary/50 border-t border-accent/20 py-8 mt-16">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-accent font-semibold mb-2">Studio</p>
              <p className="text-light/60">Warner Bros. Entertainment</p>
            </div>
            <div>
              <p className="text-accent font-semibold mb-2">Data Updated</p>
              <p className="text-light/60">Real-time Metrics</p>
            </div>
            <div>
              <p className="text-accent font-semibold mb-2">Access Level</p>
              <p className="text-light/60">Production Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
