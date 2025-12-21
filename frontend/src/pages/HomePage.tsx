import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { FilmCard } from '../components/shared/FilmCard';
import { ArtistCard } from '../components/shared/ArtistCard';
import { Search, TrendingUp, Star, Film, Home, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { titlesAPI, Title, SearchTitle } from '../api/titles';
import { artistsAPI, ArtistCard as ArtistCardType } from '../api/artists';
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
    const [searchMode, setSearchMode] = useState<'film' | 'artist'>('film'); // Toggle between film and artist
    const [suggestions, setSuggestions] = useState<SearchTitle[] | ArtistCardType[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchTitle[] | ArtistCardType[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [lastSearchedQuery, setLastSearchedQuery] = useState('');
       const debounceTimer = useRef<NodeJS.Timeout | null>(null);
       const isReturningFromDetail = useRef(false);
       const searchInputRef = useRef<HTMLInputElement>(null);
       const searchCacheRef = useRef<Map<string, (SearchTitle | ArtistCardType)[]>>(new Map()); // Cache untuk suggestions
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
      if (state.searchMode) {
        setSearchMode(state.searchMode);
      }
      // Trigger search automatically
      setTimeout(async () => {
        try {
          let results;
          if (state.searchMode === 'artist') {
            results = await artistsAPI.searchArtists(state.search);
          } else {
            results = await titlesAPI.searchTitles(state.search);
          }
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

    // Set new timer - STEP 3: DEBOUNCE CHECK (150ms wait - reduced for faster suggestions)
     debounceTimer.current = setTimeout(async () => {
       const trimmedQuery = searchQuery.trim();
       
       // Skip suggestions for artist mode
       if (searchMode === 'artist') {
         setSuggestions([]);
         setShowSuggestions(false);
         return;
       }
       
       // Skip if query is too short (less than 2 chars)
       if (trimmedQuery.length < 2) {
         setSuggestions([]);
         return;
       }
       
       // Check cache first for instant suggestions
       const cacheKey = `${searchMode}:${trimmedQuery}`;
       const cachedResults = searchCacheRef.current.get(cacheKey);
       if (cachedResults) {
         setSuggestions(cachedResults.slice(0, 5));
         setShowSuggestions(true);
         return;
       }
       
       // STEP 4: AFTER 150ms - API CALL (if not cached)
       setIsLoadingSuggestions(true);
       try {
         const results = await titlesAPI.searchTitles(searchQuery);
         
         // STEP 5: FRONTEND PROCESS - ambil 5 hasil
         if (results && Array.isArray(results)) {
           // Cache the results
           searchCacheRef.current.set(cacheKey, results);
           // Limit cache size to 20 entries
           if (searchCacheRef.current.size > 20) {
             const firstKey = searchCacheRef.current.keys().next().value;
             searchCacheRef.current.delete(firstKey);
           }
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
     }, 150); // 150ms delay (reduced from 300ms for faster response)

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, searchMode]);

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
       let results;
       if (searchMode === 'film') {
         results = await titlesAPI.searchTitles(searchQuery);
       } else {
         results = await artistsAPI.searchArtists(searchQuery);
       }
       // Pastikan results adalah array, jika null/undefined convert ke []
       setSearchResults(Array.isArray(results) ? results : []);
     } catch (err) {
       console.error('Search failed:', err);
       setError(`Failed to search ${searchMode}s`);
       setSearchResults([]);
     } finally {
       setIsSearching(false);
     }
   };

   // STEP 7: USER CLICK SUGGESTION - handleSuggestionClick()
      const handleSuggestionClick = (item: SearchTitle | ArtistCardType) => {
        console.log('Suggestion clicked:', item);
        setShowSuggestions(false);
        
        if (searchMode === 'film') {
          const film = item as SearchTitle;
          if (!film.title_id) {
            console.error('title_id is null or undefined');
            return;
          }
          navigate(`/titles/${film.title_id}`, { 
            state: { from: 'search', query: searchQuery }
          });
        } else {
          const artist = item as ArtistCardType;
          if (!artist.person_id) {
            console.error('person_id is null or undefined');
            return;
          }
          navigate(`/artists/${artist.person_id}`, {
            state: { from: 'search', query: searchQuery, mode: 'artist' }
          });
        }
      };

  return (
    <div className="w-full relative">
      {/* Navbar - Absolute at Top */}
      <nav className="absolute top-0 left-0 w-full z-50">
        <Navigation />
      </nav>

      {/* Full-bleed Hero Section - Background from top */}
      <div 
        className="relative w-full h-[65vh] bg-cover bg-center"
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
          
          {/* Search Bar with Mode Toggle */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative w-full px-8" style={{ zIndex: 999 }}>
            <div className="flex gap-3 mb-4 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSearchMode('film');
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  setHasSearched(false);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  searchMode === 'film'
                    ? 'bg-accent text-primary'
                    : 'bg-secondary text-light border border-accent/30 hover:bg-secondary/80'
                }`}
              >
                <Film size={18} />
                Films
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('artist');
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setSearchQuery('');
                  setSearchResults([]);
                  setHasSearched(false);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  searchMode === 'artist'
                    ? 'bg-accent text-primary'
                    : 'bg-secondary text-light border border-accent/30 hover:bg-secondary/80'
                }`}
              >
                <Users size={18} />
                Artists
              </button>
            </div>

            <div className="relative w-full">
              <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (searchInputRef.current) {
                      const rect = searchInputRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom,
                        left: rect.left,
                        width: rect.width,
                      });
                    }
                  }}
                  onFocus={() => {
                    if (searchInputRef.current) {
                      const rect = searchInputRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom,
                        left: rect.left,
                        width: rect.width,
                      });
                    }
                  }}
                  placeholder={searchMode === 'film' ? 'Search for movie/TV shows' : 'Search for artists'}
                   className="input-field pr-12"
                />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 bg-accent text-primary rounded-r hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center" disabled={isSearching}>
                <Search size={20} />
              </button>

              {/* STEP 6: RENDER DROPDOWN dengan 5 suggestions */}
               {showSuggestions && suggestions.length > 0 && searchMode === 'film' && (
                 <div 
                   style={{
                     position: 'absolute',
                     top: '100%',
                     left: '0',
                     right: '0',
                     marginTop: '8px',
                     zIndex: 50,
                     pointerEvents: 'auto',
                     maxHeight: '320px',
                   }}
                   className="bg-secondary border border-accent/30 rounded-lg overflow-hidden shadow-2xl"
                 >
                   {isLoadingSuggestions ? (
                     <div className="p-4 text-center text-gray-400">
                       <div className="animate-spin inline-block w-4 h-4 border-2 border-accent border-t-transparent rounded-full"></div>
                       <p className="mt-2">Loading suggestions...</p>
                     </div>
                   ) : (
                     <div className="overflow-y-auto">
                       {suggestions.map((item, index) => {
                         const isFilm = searchMode === 'film';
                         return (
                           <button
                             key={isFilm ? `${(item as SearchTitle).title_id}-${index}` : `${(item as ArtistCard).person_id}-${index}`}
                             type="button"
                             onMouseDown={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                             }}
                             onClick={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               handleSuggestionClick(item);
                             }}
                             className="w-full px-4 py-3 text-left hover:bg-primary/50 transition-colors text-light flex items-center gap-3 border-b border-accent/20 last:border-b-0"
                           >
                             {isFilm ? (
                               <>
                                 <Film size={18} className="text-accent flex-shrink-0" />
                                 <div className="flex-1 min-w-0">
                                   <div className="font-semibold truncate text-sm">{(item as SearchTitle).name}</div>
                                   <div className="text-xs text-gray-400 truncate">
                                     {(item as SearchTitle).start_year ? `Year: ${(item as SearchTitle).start_year}` : 'No year'}
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-1 flex-shrink-0">
                                   <Star className="text-accent fill-accent" size={14} />
                                   <span className="text-accent text-xs font-semibold">
                                     {(item as SearchTitle).vote_average ? (item as SearchTitle).vote_average.toFixed(1) : 'N/A'}
                                   </span>
                                 </div>
                               </>
                             ) : (
                               <>
                                 <Users size={18} className="text-accent flex-shrink-0" />
                                 <div className="flex-1 min-w-0">
                                   <div className="font-semibold truncate text-sm">{(item as ArtistCard).primary_name}</div>
                                   <div className="text-xs text-gray-400 truncate">
                                     {(item as ArtistCard).birth_year ? `Born: ${(item as ArtistCard).birth_year}` : 'No birth year'}
                                   </div>
                                 </div>
                               </>
                             )}
                           </button>
                         );
                       })}
                     </div>
                     )}
                     </div>
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
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-accent rounded"></div>
                  <h3 className="text-light text-3xl font-bold">
                    {searchMode === 'film' ? 'Films' : 'People'}
                  </h3>
                </div>
                {searchMode === 'film' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {searchResults.map((title, index) => (
                      <FilmCard
                        key={`search-${(title as SearchTitle).title_id}-${index}`}
                        titleId={(title as SearchTitle).title_id || ''}
                        name={(title as SearchTitle).name || ''}
                        year={(title as SearchTitle).start_year}
                        genre={(title as SearchTitle).genre_name}
                        rating={(title as SearchTitle).vote_average}
                        onNavigate={(id) => navigate(`/titles/${id}`, { 
                          state: { from: 'search', query: searchQuery }
                        })}
                      />
                    ))}
                  </div>
                ) : (
                   <div className="bg-secondary border border-accent/20 rounded-lg overflow-hidden">
                     {searchResults.map((artist, index) => {
                       const a = artist as ArtistCardType;
                       return (
                         <ArtistCard
                           key={`search-${a.person_id}-${index}`}
                           artist={a}
                           onClick={() => navigate(`/artists/${a.person_id}`, {
                             state: { from: 'search', query: searchQuery, mode: 'artist' }
                           })}
                         />
                       );
                     })}
                   </div>
                 )}
                 </>
               ) : (
               <div className="bg-secondary/50 rounded-lg p-12 text-center border border-yellow-300">
                 {searchMode === 'film' ? (
                   <>
                     <Film className="text-gray-500 mx-auto mb-4" size={64} />
                     <p className="text-white-500 text-lg font-bold mb-2">No Films Found</p>
                     <p className="text-gray-400 text-md mb-8">Sorry, we couldn't find any film matching "{searchQuery}"</p>
                   </>
                 ) : (
                   <>
                     <Users className="text-gray-500 mx-auto mb-4" size={64} />
                     <p className="text-white-500 text-lg font-bold mb-2">No Artists Found</p>
                     <p className="text-gray-400 text-md mb-8">Sorry, we couldn't find any artist matching "{searchQuery}"</p>
                   </>
                 )}
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
                <FilmCard
                  key={title.title_id}
                  titleId={title.title_id}
                  name={title.name}
                  year={title.start_year}
                  genre={title.genre_name}
                  rating={title.vote_average}
                />
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
                <FilmCard
                  key={title.title_id}
                  titleId={title.title_id}
                  name={title.name}
                  year={title.start_year}
                  genre={title.genre_name}
                  rating={title.vote_average}
                />
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