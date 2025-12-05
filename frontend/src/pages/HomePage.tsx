import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { Search, TrendingUp, Star, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { titlesAPI, Title, SearchTitle } from '../api/titles';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trendingTitles, setTrendingTitles] = useState<Title[]>([]);
  const [topRatedTitles, setTopRatedTitles] = useState<Title[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [topRatedLoading, setTopRatedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
   const [searchQuery, setSearchQuery] = useState('');
   const [suggestions, setSuggestions] = useState<SearchTitle[]>([]);
   const [showSuggestions, setShowSuggestions] = useState(false);
   const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
   const [searchResults, setSearchResults] = useState<SearchTitle[]>([]);
   const [isSearching, setIsSearching] = useState(false);
   const [hasSearched, setHasSearched] = useState(false);
   const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial data
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

  // STEP 2: useEffect[searchQuery] - Debounce search suggestions
  useEffect(() => {
    // If search query is empty, hide suggestions
    if (!searchQuery.trim()) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer - STEP 3: DEBOUNCE CHECK (300ms wait)
    debounceTimer.current = setTimeout(async () => {
      // STEP 4: AFTER 300ms - API CALL
      setIsLoadingSuggestions(true);
      try {
        const results = await titlesAPI.searchTitles(searchQuery);
        // STEP 5: FRONTEND PROCESS - ambil 5 hasil
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms delay

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Handle search submission (from form submit button)
   const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     
     if (!searchQuery.trim()) {
       setHasSearched(false);
       setSearchResults([]);
       return;
     }

     setIsSearching(true);
     setHasSearched(true);
     setShowSuggestions(false);
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

   // STEP 7: USER CLICK SUGGESTION - handleSuggestionClick()
   const handleSuggestionClick = (title: SearchTitle) => {
     setShowSuggestions(false);
     navigate(`/titles/${title.title_id}`);
   };

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-secondary to-primary py-24">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-light text-5xl font-bold mb-6">
              Discover Your Next Favorite Film
            </h2>
            <p className="text-gray-400 text-xl">
              Search through millions of movies and TV shows
            </p>
            {user && (
              <p className="text-accent text-lg mt-4">
                Welcome back, {user.full_name}!
              </p>
            )}
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for films, actors, directors..."
                className="input-field pr-14"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-primary p-3 rounded hover:bg-accent/90 transition-colors disabled:opacity-50" disabled={isSearching}>
                <Search size={24} />
              </button>

              {/* STEP 6: RENDER DROPDOWN dengan 5 suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-accent/30 rounded-lg overflow-hidden z-50 shadow-lg">
                  {isLoadingSuggestions ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-accent border-t-transparent rounded-full"></div>
                      <p className="mt-2">Loading suggestions...</p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {suggestions.map((title, index) => (
                        <button
                          key={`${title.title_id}-${index}`}
                          type="button"
                          onClick={() => handleSuggestionClick(title)}
                          className="w-full px-4 py-3 text-left hover:bg-primary/50 transition-colors text-light flex items-center gap-3 border-b border-accent/20 last:border-b-0"
                        >
                          <Film size={18} className="text-accent flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold truncate text-sm">{title.name}</div>
                            <div className="text-xs text-gray-400 truncate">
                              {title.overview ? title.overview.substring(0, 60) + '...' : 'No description'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="text-accent fill-accent" size={14} />
                            <span className="text-accent text-xs font-semibold">
                              {title.vote_average ? title.vote_average.toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Search Results Section */}
      {hasSearched && (
        <div className="py-16 bg-secondary">
          <div className="max-w-[1600px] mx-auto px-8">
            <h3 className="text-light text-3xl font-bold mb-8">Search Results for "{searchQuery}"</h3>
            
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