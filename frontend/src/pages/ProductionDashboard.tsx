import { useEffect, useState } from 'react';
import { Navigation } from '../components/shared/Navigation';
import { TrendingUp, Star, Film, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { titlesAPI, Title, SearchTitle } from '../api/titles';

export function ProductionDashboard() {
  const navigate = useNavigate();
  const [trendingTitles, setTrendingTitles] = useState<Title[]>([]);
  const [topRatedTitles, setTopRatedTitles] = useState<Title[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchTitle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        setError(null);

        // Fetch trending titles
        setTrendingLoading(true);
        const trendingData = await titlesAPI.getTrendingTitles(6);
        setTrendingTitles(trendingData);

        // Fetch top-rated titles
        setTopRatedLoading(true);
        const topRatedData = await titlesAPI.getTopRatedTitles(6);
        setTopRatedTitles(topRatedData);
      } catch (err) {
        console.error('Failed to fetch titles:', err);
        setError('Failed to load titles');
      } finally {
        setTrendingLoading(false);
        setTopRatedLoading(false);
      }
    };

    fetchTitles();
  }, []);

  // Handle search submission
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await titlesAPI.searchTitles(searchQuery);
      setSearchResults(results);
      setError(null);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to search titles');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-secondary to-primary py-24">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-light text-5xl font-bold mb-6">
              Production Dashboard
            </h2>
            <p className="text-gray-400 text-xl">
              View and manage production catalog
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for films, actors, directors..."
              className="input-field pr-14"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-primary p-3 rounded hover:bg-accent/90 transition-colors disabled:opacity-50"
              disabled={isSearching}
            >
              <Search size={24} />
            </button>
          </form>
        </div>
      </div>

      {/* Search Results Section */}
      {hasSearched && (
        <div className="py-16 bg-secondary">
          <div className="max-w-[1600px] mx-auto px-8">
            <h3 className="text-light text-3xl font-bold mb-8">
              Search Results for "{searchQuery}"
            </h3>

            {isSearching ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {searchResults.map((title) => (
                  <div
                    key={title.title_id}
                    onClick={() => navigate(`/titles/${title.title_id}`)}
                    className="card hover:border-accent transition-colors cursor-pointer group"
                  >
                    <div className="aspect-[2/3] bg-primary/50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-primary/70 transition-colors">
                      <Film className="text-accent" size={48} />
                    </div>
                    <h4 className="text-light font-semibold mb-2 line-clamp-2 text-sm h-10">
                      {title.name || 'Unknown Title'}
                    </h4>
                    <p className="text-gray-400 text-xs mb-3 line-clamp-3">
                      {title.overview || 'No description available'}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="text-accent fill-accent" size={16} />
                      <span className="text-accent font-semibold text-sm">
                        {title.vote_average ? title.vote_average.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trending Section */}
      {!hasSearched && (
        <div className="py-7 bg-primary">
          <div className="max-w-[1600px] mx-auto px-8">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="text-accent" size={32} />
              <h3 className="text-light text-3xl font-bold">Trending Now</h3>
            </div>

            {error && (
              <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {trendingLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading trending titles...</p>
              </div>
            ) : trendingTitles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {trendingTitles.map((title) => (
                  <div
                    key={title.title_id}
                    onClick={() => navigate(`/titles/${title.title_id}`)}
                    className="card hover:border-accent transition-colors cursor-pointer group"
                  >
                    <div className="aspect-[2/3] bg-secondary/50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-secondary transition-colors">
                      <Film className="text-accent" size={48} />
                    </div>
                    <h4 className="text-light font-semibold mb-1 line-clamp-2 text-sm h-10">
                      {title.name}
                    </h4>
                    <p className="text-gray-400 text-xs mb-2">
                      {title.start_year} • {title.genre_name}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="text-accent fill-accent" size={16} />
                      <span className="text-accent font-semibold text-sm">
                        {title.vote_average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No trending titles found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Rated Section */}
      {!hasSearched && (
        <div className="py-16 bg-secondary">
          <div className="max-w-[1600px] mx-auto px-8">
            <div className="flex items-center gap-3 mb-8">
              <Star className="text-accent fill-accent" size={32} />
              <h3 className="text-light text-3xl font-bold">Top Rated</h3>
            </div>

            {topRatedLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading top-rated titles...</p>
              </div>
            ) : topRatedTitles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {topRatedTitles.map((title) => (
                  <div
                    key={title.title_id}
                    onClick={() => navigate(`/titles/${title.title_id}`)}
                    className="card hover:border-accent transition-colors cursor-pointer group"
                  >
                    <div className="aspect-[2/3] bg-primary/50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-primary/70 transition-colors">
                      <Film className="text-accent" size={48} />
                    </div>
                    <h4 className="text-light font-semibold mb-1 line-clamp-2 text-sm h-10">
                      {title.name}
                    </h4>
                    <p className="text-gray-400 text-xs mb-2">
                      {title.start_year} • {title.genre_name}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="text-accent fill-accent" size={16} />
                      <span className="text-accent font-semibold text-sm">
                        {title.vote_average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No top-rated titles found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
