import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { Search, TrendingUp, Star, Film, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { titlesAPI, Title, SearchTitle } from '../api/titles';
import bannerImage from '../assets/movie-posters-banner.jpg.jpg';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    const [lastSearchedQuery, setLastSearchedQuery] = useState('');
       const debounceTimer = useRef<NodeJS.Timeout | null>(null);
       const isReturningFromDetail = useRef(false);
       const searchInputRef = useRef<HTMLInputElement>(null);
       const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Close dropdown when clicking outside
   useEffect(() => {
     const handleClickOutside = (event: MouseEvent) => {
       if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
         setShowSuggestions(false);
       }
     };

     if (showSuggestions) {
       document.addEventListener('mousedown', handleClickOutside);
       return () => document.removeEventListener('mousedown', handleClickOutside);
     }
   }, [showSuggestions]);

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

    // Check if coming back from detail page with search state
    const state = location.state as any;
    if (state?.returnToSearch && state?.search) {
      isReturningFromDetail.current = true;
      setSearchQuery(state.search);
      setHasSearched(true);
      setShowSuggestions(false);
      // Trigger search automatically
      setTimeout(async () => {
        try {
          const results = await titlesAPI.searchTitles(state.search);
          setSearchResults(Array.isArray(results) ? results : []);
          // Scroll to results section
          setTimeout(() => {
            const resultsSection = document.getElementById('search-results-section');
            if (resultsSection) {
              resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        } catch (err) {
          console.error('Search failed:', err);
          setSearchResults([]);
        }
      }, 100);
    } else {
      // Clear any previous search state jika tidak returnToSearch
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, []);

  // STEP 2: useEffect[searchQuery] - Debounce search suggestions
  useEffect(() => {
    // If search query is empty, hide suggestions
    if (!searchQuery.trim()) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    // Skip suggestions jika user sedang viewing search results dengan query yang sama
    if (hasSearched && searchQuery === lastSearchedQuery) {
      setShowSuggestions(false);
      return;
    }

    // Skip suggestions jika returning dari detail page
    if (isReturningFromDetail.current) {
      isReturningFromDetail.current = false;
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
        if (results && Array.isArray(results)) {
          setSuggestions(results.slice(0, 5));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
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
       setError(null);
       return;
     }

     setIsSearching(true);
     setHasSearched(true);
     setLastSearchedQuery(searchQuery);
     setShowSuggestions(false);
     setError(null);
     try {
       const results = await titlesAPI.searchTitles(searchQuery);
       // Pastikan results adalah array, jika null/undefined convert ke []
       setSearchResults(Array.isArray(results) ? results : []);
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
      console.log('Suggestion clicked:', title);
      if (!title.title_id) {
        console.error('title_id is null or undefined');
        return;
      }
      setShowSuggestions(false);
      navigate(`/titles/${title.title_id}`, { 
        state: { from: 'search', query: searchQuery }
      });
    };

  return (
    <div className="w-full relative">
      {/* Navbar - Absolute at Top */}
      <nav className="absolute top-0 left-0 w-full z-50">
        <Navigation />
      </nav>

      {/* Full-bleed Hero Section - Background from top */}
      <div 
        className="relative w-full h-[65vh] bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Color Grading Overlay - Dark Navy Tone */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C1821]/80 via-[#1B2A41]/60 to-[#0C1821]/80 pointer-events-none"></div>

        {/* Cool Tone Enhancement */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: 'rgba(15, 27, 51, 0.3)',
            mixBlendMode: 'multiply',
          }}
        ></div>

        {/* Film Grain Texture */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' seed='2' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        ></div>

        {/* Hero Content - Centered */}
        <div className="absolute inset-0 z-10 w-full flex flex-col items-center justify-center pt-16">
          <div className="text-center mb-12">
            <h2 className="text-light text-5xl font-bold mb-6 drop-shadow-lg">
              Discover Your Next Favorite Film
            </h2>
            {user && (
              <p className="text-accent text-lg drop-shadow">
                Welcome back, {user.full_name}!
              </p>
            )}
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative w-full px-8">
            <div className="relative">
              <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (searchInputRef.current) {
                      const rect = searchInputRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width,
                      });
                    }
                  }}
                  onFocus={() => {
                    if (searchInputRef.current) {
                      const rect = searchInputRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width,
                      });
                    }
                  }}
                  placeholder="Search for movie/TV shows"
                  className="input-field pr-14"
                />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-primary p-3 rounded hover:bg-accent/90 transition-colors disabled:opacity-50" disabled={isSearching}>
                <Search size={24} />
              </button>

              {/* STEP 6: RENDER DROPDOWN dengan 5 suggestions menggunakan Portal */}
               {showSuggestions && suggestions.length > 0 && createPortal(
                 <div 
                   style={{
                     position: 'fixed',
                     top: `${dropdownPosition.top}px`,
                     left: `${dropdownPosition.left}px`,
                     width: `${dropdownPosition.width}px`,
                     zIndex: 9999,
                     pointerEvents: 'auto',
                   }}
                   className="bg-secondary border border-accent/30 rounded-lg overflow-hidden shadow-lg"
                 >
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
                           onMouseDown={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                           }}
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             handleSuggestionClick(title);
                           }}
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
                 </div>,
                 document.body
               )}
            </div>
          </form>
        </div>
      </div>

      {/* Rest of Page Content */}
      <div className="bg-primary">
      {/* Search Results Section */}
      {hasSearched && (
        <div id="search-results-section" className="py-16 bg-secondary min-h-screen">
          <div className="max-w-[1600px] mx-auto px-8">
            {/* Back Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setHasSearched(false);
                setShowSuggestions(false);
                setSuggestions([]);
              }}
              className="flex items-center gap-2 text-accent hover:text-accent/80 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Back</span>
            </button>

            {isSearching ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
              <h3 className="text-light text-3xl font-bold mb-8">Search Results for "{searchQuery}"</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                 {searchResults.map((title, index) => (
                   <div
                      key={`search-${title.title_id}-${index}`}
                      onClick={() => navigate(`/titles/${title.title_id}`, { 
                        state: { from: 'search', query: searchQuery }
                      })}
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
               </>
             ) : (
               <div className="bg-secondary/50 rounded-lg p-12 text-center border border-yellow-300">
                 <Film className="text-gray-500 mx-auto mb-4" size={64} />
                 <p className="text-white-500 text-lg font-bold mb-2">No Movie/TV Shows Found</p>
                 <p className="text-gray-400 text-md mb-8">Sorry, we couldn't find any movie matching "{searchQuery}"</p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <button
                     onClick={() => {
                       setHasSearched(false);
                       setSearchResults([]);
                       setSearchQuery('');
                     }}
                     className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                   >
                     <Home size={20} />
                     Back to Home
                   </button>
                   <button
                     onClick={() => setSearchQuery('')}
                     className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary border border-accent text-accent font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
                   >
                     <Search size={20} />
                     Search Again
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Trending Section */}
      {!hasSearched && (
      <div className="pt-4 pb-3 bg-primary">
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
      </div>
      );
      }