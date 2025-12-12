import { Navigation } from '../components/shared/Navigation';

export function ProductionDashboard() {
  return (
    <div className="min-h-screen bg-primary">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-b from-secondary to-primary py-12">
        <div className="max-w-[1600px] mx-auto px-8">
          <h1 className="text-light text-5xl font-bold">Production Dashboard</h1>
          <p className="text-gray-400 text-lg mt-2">Manage and monitor productions</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-secondary/50 rounded-lg border border-accent/20 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Widget {i}</p>
                <p className="text-gray-500 text-xs mt-1">Coming soon</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
