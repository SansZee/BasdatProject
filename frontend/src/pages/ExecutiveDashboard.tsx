import { useState, useEffect } from 'react';
import { Navigation } from '../components/shared/Navigation';
import KPICard from '../components/KPICard';
import { GenreTrendChart } from '../components/charts/GenreTrendChart';
import { SummaryTrendChart } from '../components/charts/SummaryTrendChart';
import { BestTitlesList } from '../components/DashboardCards/BestTitlesList';
import { TopCompaniesList } from '../components/DashboardCards/TopCompaniesList';
import { executiveAPI } from '../api/executive';

const COMPANY_ID = '11454';

export function ExecutiveDashboard() {
  const [companyRank, setCompanyRank] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await executiveAPI.getAvailableYears(COMPANY_ID);
        setAvailableYears(years);
        if (years.length > 0 && !selectedYear) {
          setSelectedYear(years[0]);
        }
      } catch (error) {
        console.error('Failed to fetch available years:', error);
      }
    };
    fetchYears();
  }, []);

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-secondary via-secondary to-primary py-16 border-b border-accent/20">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-light text-7xl font-bold mb-3">
                Warner Bros.
              </h1>
              <p className="text-accent text-xl font-semibold">
                Entertainment & Content Analytics Dashboard
              </p>
            </div>
            {/* Year Filter */}
            <div className="flex flex-col items-end">
              <label className="text-light/60 text-sm mb-2">Filter by Year</label>
              <select
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 bg-secondary border border-accent/30 text-light rounded hover:border-accent/60 transition-colors"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 text-light/60 text-sm">
            <span>Real-time Performance Metrics</span>
            <span>•</span>
            <span>Premium Content Analysis</span>
            <span>•</span>
            <span>Quality Assurance</span>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-light text-3xl font-bold mb-2">
            Key Performance Indicators
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-1 bg-gradient-to-r from-accent to-accent/30"></div>
            <p className="text-light/60">Comprehensive production overview</p>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICard companyID={COMPANY_ID} year={selectedYear} />
      </div>

      {/* Analytics Section - 2x2 Grid */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-light text-3xl font-bold mb-2">
            Detailed Analytics
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-1 bg-gradient-to-r from-accent to-accent/30"></div>
            <p className="text-light/60">Production trends and performance metrics</p>
          </div>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Genre Trend Chart */}
          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <h3 className="text-light text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-accent">📊</span>
              Genre Trend Analysis
            </h3>
            <GenreTrendChart companyID={COMPANY_ID} />
          </div>

          {/* Summary Trend Chart */}
          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <h3 className="text-light text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-accent">📈</span>
              Production Summary Trend
            </h3>
            <SummaryTrendChart companyID={COMPANY_ID} />
          </div>

          {/* Best Titles */}
          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <h3 className="text-light text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-accent">🎬</span>
              Top Performing Titles
            </h3>
            <BestTitlesList companyID={COMPANY_ID} top={5} year={selectedYear} />
          </div>

          {/* Top Companies */}
          <div className="bg-secondary/30 border border-accent/20 rounded-lg p-6 hover:border-accent/50 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-light text-xl font-bold flex items-center gap-2">
                <span className="text-accent">🏆</span>
                Top Production Companies
              </h3>
              {/* Warner Bros Rank Badge */}
              {companyRank && (
                <div className="bg-accent/20 px-3 py-1 rounded-full border border-accent/50">
                  <p className="text-accent text-sm font-bold">
                    Rank: <span className="text-lg">#{companyRank}</span>
                  </p>
                </div>
              )}
            </div>
            <TopCompaniesList 
              top={5} 
              highlightCompanyID={COMPANY_ID}
              onRankChange={setCompanyRank}
            />
          </div>
        </div>
      </div>

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
              <p className="text-light/60">Real-time Analytics</p>
            </div>
            <div>
              <p className="text-accent font-semibold mb-2">Access Level</p>
              <p className="text-light/60">Executive Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
