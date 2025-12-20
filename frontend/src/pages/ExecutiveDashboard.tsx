import { Navigation } from '../components/shared/Navigation';
import KPICard from '../components/KPICard';

export function ExecutiveDashboard() {
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
              Entertainment & Content Analytics Dashboard
            </p>
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
      <div className="max-w-[1600px] mx-auto px-8 py-16">
        {/* Section Title */}
        <div className="mb-12">
          <h2 className="text-light text-3xl font-bold mb-2">
            Key Performance Indicators
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-1 bg-gradient-to-r from-accent to-accent/30"></div>
            <p className="text-light/60">Comprehensive production overview</p>
          </div>
        </div>

        {/* KPI Cards */}
        <KPICard companyID="11454" />
      </div>

      {/* Footer Section */}
      <div className="bg-secondary/50 border-t border-accent/20 py-12 mt-16">
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
