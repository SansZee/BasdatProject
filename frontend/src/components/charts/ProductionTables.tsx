import React from 'react';
import { Star, Users, Clock, Calendar } from 'lucide-react';

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

// In Production Table
export const ProductionInProductionTable: React.FC<{ data: ProductionData[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-400">No titles in production</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/80 border-b border-accent/20">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light">Title</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light">Genres</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-light">Rating</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-light">Cast</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-light">Runtime</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-light">Popularity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-accent/10">
          {data.map((item) => (
            <tr key={item.title_id} className="hover:bg-secondary/50 transition-colors">
              <td className="px-4 py-3">
                <div>
                  <p className="font-semibold text-light text-sm">{item.title_name}</p>
                  <p className="text-xs text-gray-400">{item.production_companies}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {item.genres?.split(',').slice(0, 2).map((genre, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 text-xs rounded-full bg-accent/20 text-accent">
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-light">{item.rating}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-light">{item.cast_count}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-light">
                    {item.runtime_minutes > 60
                      ? `${Math.floor(item.runtime_minutes / 60)}h ${item.runtime_minutes % 60}m`
                      : `${item.runtime_minutes}m`}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20">
                  <span className="text-sm font-bold text-green-400">{(item.popularity / 1000).toFixed(1)}K</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Planned Projects Table
export const ProductionPlannedTable: React.FC<{ data: PlannedData[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-400">No planned projects</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/80 border-b border-accent/20">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light">Title</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light">Genres</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-light">Start Year</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-light">Planned Cast</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-accent/10">
          {data.map((item) => (
            <tr key={item.title_id} className="hover:bg-secondary/50 transition-colors">
              <td className="px-4 py-3">
                <div>
                  <p className="font-semibold text-light text-sm">{item.title_name}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{item.production_companies}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {item.genres?.split(',').slice(0, 2).map((genre, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-light">{item.start_year}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-light">{item.planned_cast_count}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 0 && (
        <div className="px-4 py-3 bg-secondary/50 border-t border-accent/10 text-xs text-gray-400">
          Showing {data.length} planned project{data.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// Top Cast Table
export const ProductionCastTable: React.FC<{ data: CastData[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-400">No cast members found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/80 border-b border-accent/20">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-light">Professions</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-light">Total Projects</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-light">In Production</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-light">Avg Rating</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-accent/10">
          {data.map((item) => (
            <tr key={item.person_id} className="hover:bg-secondary/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {item.person_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-light text-sm">{item.person_name}</p>
                    <p className="text-xs text-gray-400">ID: {item.person_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {item.professions?.split(',').slice(0, 2).map((prof, pidx) => (
                    <span key={pidx} className="inline-block px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">
                      {prof.trim()}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-bold text-light">{item.total_projects}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20">
                  <span className="text-sm font-bold text-green-400">{item.in_production_projects}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-light">{item.avg_rating.toFixed(1)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 0 && (
        <div className="px-4 py-3 bg-secondary/50 border-t border-accent/10 text-xs text-gray-400">
          Showing top {data.length} most active cast members
        </div>
      )}
    </div>
  );
};
