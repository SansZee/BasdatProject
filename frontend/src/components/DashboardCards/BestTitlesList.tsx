import { useEffect, useState } from 'react';
import { executiveAPI, BestTitle } from '../../api/executive';

interface Props {
  companyID: string;
  top?: number;
  year?: number;
}

export function BestTitlesList({ companyID, top = 5, year }: Props) {
  const [titles, setTitles] = useState<BestTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await executiveAPI.getBestTitles(companyID, top, year);
        setTitles(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch best titles');
        setTitles([]);
      } finally {
        setLoading(false);
      }
    };

    if (companyID) {
      fetchData();
    }
  }, [companyID, top, year]);

  if (loading) {
    return <div className="flex items-center justify-center h-80 text-light/60">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-80 text-red-500">Error: {error}</div>;
  }

  if (titles.length === 0) {
    return <div className="flex items-center justify-center h-80 text-light/60">No data available</div>;
  }

  return (
    <div 
      className="space-y-3 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-secondary/30 [&::-webkit-scrollbar-thumb]:bg-yellow-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-yellow-500"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4af37 #1a1a1a' }}
    >
      {titles.map((title, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-4 bg-secondary/40 rounded-lg border border-accent/20 hover:border-accent/50 transition-colors"
        >
          <div className="flex-1">
            <p className="text-light font-semibold text-sm truncate">{title.name}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-light/60">
              <span className="flex items-center gap-1">
                <span className="text-accent">⭐</span>
                {title.vote_average.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-accent">👁️</span>
                {title.vote_count.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 text-accent font-bold">
              {idx + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
