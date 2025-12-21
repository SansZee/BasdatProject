import { useEffect, useState } from 'react';
import { executiveAPI, TopCompany } from '../../api/executive';

interface Props {
  top?: number;
  highlightCompanyID?: string;
  onRankChange?: (rank: number | null) => void;
}

export function TopCompaniesList({ top = 5, highlightCompanyID, onRankChange }: Props) {
  const [companies, setCompanies] = useState<TopCompany[]>([]);
  const [highlightedRank, setHighlightedRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch more companies to find rank of highlighted company
        const fetchCount = highlightCompanyID ? Math.max(top || 5, 10) : top;
        const data = await executiveAPI.getTopCompanies(fetchCount);
        
        if (highlightCompanyID) {
          const rankIndex = data.findIndex(
            c => c.production_company_type_id === highlightCompanyID
          );
          if (rankIndex !== -1) {
            const rank = rankIndex + 1;
            setHighlightedRank(rank);
            onRankChange?.(rank);
          }
        }
        
        // Only show top N in the list
        setCompanies(data.slice(0, top || 5));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch top companies');
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [top, highlightCompanyID]);

  if (loading) {
    return <div className="flex items-center justify-center h-80 text-light/60">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-80 text-red-500">Error: {error}</div>;
  }

  if (companies.length === 0) {
    return <div className="flex items-center justify-center h-80 text-light/60">No data available</div>;
  }

  return (
    <div className="space-y-3">
      <div 
        className="max-h-80 overflow-y-auto space-y-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-secondary/30 [&::-webkit-scrollbar-thumb]:bg-yellow-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-yellow-500"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4af37 #1a1a1a' }}
      >
        {companies.map((company, idx) => (
          <div
            key={company.production_company_type_id}
            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
              company.production_company_type_id === highlightCompanyID
                ? 'bg-accent/20 border border-accent/60'
                : 'bg-secondary/40 border border-accent/20 hover:border-accent/50'
            }`}
          >
            <div className="flex-1">
              <p className="text-light font-semibold text-sm truncate">{company.production_company_name}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-light/60">
                <span className="flex items-center gap-1">
                  <span className="text-accent">🎬</span>
                  {company.jumlah_tayangan} productions
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-accent">⭐</span>
                  {company.avg_rating.toFixed(1)}
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
    </div>
  );
}
