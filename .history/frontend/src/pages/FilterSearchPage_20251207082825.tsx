import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { FilterResultCard } from '../components/FilterResultCard';
import { Film, Home, ArrowLeft } from 'lucide-react';
import { titlesAPI, FilterRequest, FilteredTitle, FilterOptionsResponse } from '../api/titles';

const SORT_OPTIONS = [
    { id: 'released', label: 'Release Date' },
    { id: 'popularity', label: 'Most Viewed' },
    { id: 'name', label: 'Name' },
    { id: 'rating', label: 'IMDb Rating' },
];

export function FilterSearchPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [results, setResults] = useState<FilteredTitle[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Filter options dari database
    const [filterOptions, setFilterOptions] = useState<FilterOptionsResponse | null>(null);

    // Filter states - multi-select arrays
    const [filters, setFilters] = useState({
        genreIds: [] as string[],
        typeIds: [] as string[],
        statusIds: [] as string[],
        yearIds: [] as string[],
        sortBy: 'released',
    });

    const itemsPerPage = 25; // 5 columns × 5 rows
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Fetch filter options on mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setIsLoadingOptions(true);
                const options = await titlesAPI.getFilterOptions();
                setFilterOptions(options);
            } catch (err) {
                console.error('Failed to fetch filter options:', err);
            } finally {
                setIsLoadingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    const handleFilterChange = (key: string, value: any) => {
        if (key === 'genreIds' || key === 'typeIds' || key === 'statusIds' || key === 'yearIds') {
            // For checkboxes - toggle item in/out of array
            setFilters(prev => {
                const currentArray = prev[key as keyof typeof prev] as string[];
                if (currentArray.includes(value)) {
                    // Remove if already selected
                    return { ...prev, [key]: currentArray.filter(id => id !== value) };
                } else {
                    // Add if not selected
                    return { ...prev, [key]: [...currentArray, value] };
                }
            });
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
        setCurrentPage(1); // Reset to page 1 when filter changes
    };

    const handleSearch = async (page: number = 1) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const filterRequest: FilterRequest = {
                genreIds: filters.genreIds.length > 0 ? filters.genreIds : undefined,
                typeIds: filters.typeIds.length > 0 ? filters.typeIds : undefined,
                statusIds: filters.statusIds.length > 0 ? filters.statusIds : undefined,
                originCountryIds: undefined,
                productionCountryIds: undefined,
                year: filters.yearIds.length > 0 ? Number(filters.yearIds[0]) : undefined,
                sortBy: filters.sortBy || 'released',
                page,
                limit: itemsPerPage,
            };

            const response = await titlesAPI.filterTitles(filterRequest);

            if (response && response.success) {
                setResults(response.data || []);
                setTotalCount(response.count || 0);
                setCurrentPage(page);
            } else {
                setError('No results found');
                setResults([]);
                setTotalCount(0);
            }
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || 'Error fetching results';
            setError(errorMsg);
            setResults([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary">
            <style>{`
                .filter-scrollable {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(248, 192, 0, 0.8) transparent;
                }
                .filter-scrollable::-webkit-scrollbar {
                    width: 8px;
                }
                .filter-scrollable::-webkit-scrollbar-track {
                    background: transparent;
                }
                .filter-scrollable::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, rgba(248, 192, 0, 1) 0%, rgba(248, 192, 0, 0.7) 100%);
                    border-radius: 10px;
                    transition: background 0.3s ease;
                }
                .filter-scrollable::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, rgba(255, 215, 0, 1) 0%, rgba(248, 192, 0, 0.9) 100%);
                    box-shadow: 0 0 6px rgba(248, 192, 0, 0.5);
                }
            `}</style>
            <Navigation />

            {/* Header */}
            <div className="bg-gradient-to-b from-secondary to-primary py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h1 className="text-light text-4xl font-bold mb-3">Filter Search</h1>
                    <p className="text-gray-400">Find movies and series with filters</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-3 bg-primary">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filter Panel */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-20 bg-secondary rounded-lg border border-accent/20 p-6">
                                <h2 className="text-light text-xl font-bold mb-6">Filters</h2>

                                {/* Genre */}
                                <div className="mb-8">
                                    <label className="block text-light font-semibold mb-4 text-sm uppercase tracking-wider">Genre</label>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 filter-scrollable">
                                        {isLoadingOptions ? (
                                            <p className="text-gray-400 text-sm">Loading...</p>
                                        ) : filterOptions?.genres && filterOptions.genres.length > 0 ? (
                                            filterOptions.genres.map(g => (
                                                <label key={g.genre_type_id} className="flex items-center cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.genreIds.includes(g.genre_type_id)}
                                                        onChange={() => handleFilterChange('genreIds', g.genre_type_id)}
                                                        className="w-4 h-4 rounded border-gray-500 text-accent focus:ring-2 focus:ring-accent cursor-pointer accent-accent"
                                                    />
                                                    <span className="ml-3 text-light text-sm group-hover:text-accent transition-colors">
                                                        {g.genre_name}
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm">No genres available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Type */}
                                <div className="mb-8">
                                    <label className="block text-light font-semibold mb-4 text-sm uppercase tracking-wider">Type</label>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 filter-scrollable">
                                        {isLoadingOptions ? (
                                            <p className="text-gray-400 text-sm">Loading...</p>
                                        ) : filterOptions?.types && filterOptions.types.length > 0 ? (
                                            filterOptions.types.map(t => (
                                                <label key={t.type_id} className="flex items-center cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.typeIds.includes(t.type_id)}
                                                        onChange={() => handleFilterChange('typeIds', t.type_id)}
                                                        className="w-4 h-4 rounded border-gray-500 text-accent focus:ring-2 focus:ring-accent cursor-pointer accent-accent"
                                                    />
                                                    <span className="ml-3 text-light text-sm group-hover:text-accent transition-colors">
                                                        {t.type_name}
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm">No types available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="mb-8">
                                    <label className="block text-light font-semibold mb-4 text-sm uppercase tracking-wider">Status</label>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 filter-scrollable">
                                        {isLoadingOptions ? (
                                            <p className="text-gray-400 text-sm">Loading...</p>
                                        ) : filterOptions?.statuses && filterOptions.statuses.length > 0 ? (
                                            filterOptions.statuses.map(s => (
                                                <label key={s.status_id} className="flex items-center cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.statusIds.includes(s.status_id)}
                                                        onChange={() => handleFilterChange('statusIds', s.status_id)}
                                                        className="w-4 h-4 rounded border-gray-500 text-accent focus:ring-2 focus:ring-accent cursor-pointer accent-accent"
                                                    />
                                                    <span className="ml-3 text-light text-sm group-hover:text-accent transition-colors">
                                                        {s.status_name}
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm">No statuses available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Year */}
                                <div className="mb-8">
                                    <label className="block text-light font-semibold mb-4 text-sm uppercase tracking-wider">Year</label>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 filter-scrollable">
                                        {isLoadingOptions ? (
                                            <p className="text-gray-400 text-sm">Loading...</p>
                                        ) : filterOptions?.years && filterOptions.years.length > 0 ? (
                                            filterOptions.years.map(y => (
                                                <label key={y} className="flex items-center cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.yearIds.includes(String(y))}
                                                        onChange={() => handleFilterChange('yearIds', String(y))}
                                                        className="w-4 h-4 rounded border-gray-500 text-accent focus:ring-2 focus:ring-accent cursor-pointer accent-accent"
                                                    />
                                                    <span className="ml-3 text-light text-sm group-hover:text-accent transition-colors">
                                                        {y}
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm">No years available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Sort By */}
                                <div className="mb-6">
                                    <label className="block text-light font-semibold mb-3">Sort By</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full bg-primary text-light border border-gray-600 rounded px-3 py-2"
                                    >
                                        {SORT_OPTIONS.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Search Button */}
                                <button
                                    onClick={() => handleSearch(1)}
                                    disabled={isLoading}
                                    className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'SEARCHING...' : 'SEARCH'}
                                </button>
                            </div>
                        </div>

                        {/* Results Panel */}
                        <div className="lg:col-span-3">
                            {isLoading && (
                                <div className="flex items-center justify-center py-32">
                                    <div className="text-center">
                                        <svg className="animate-spin h-12 w-12 text-yellow-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="text-gray-400 text-lg">Filtering movies...</p>
                                    </div>
                                </div>
                            )}

                            {!isLoading && error && (
                                <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            {!isLoading && hasSearched && results.length > 0 ? (
                                <>
                                    <div className="mb-6">
                                        <p className="text-gray-400">
                                            Showing <span className="text-accent font-semibold">{results.length}</span> of{' '}
                                            <span className="text-accent font-semibold">{totalCount}</span> results
                                        </p>
                                    </div>

                                    {/* Results Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                                        {results.map((title) => (
                                            <FilterResultCard
                                                key={title.title_id}
                                                title={title}
                                            />
                                        ))}
                                    </div>

                                    {/* Advanced Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                                            <button
                                                onClick={() => handleSearch(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1 || isLoading}
                                                className="px-4 py-2 bg-secondary text-light rounded hover:bg-secondary/80 disabled:opacity-50"
                                            >
                                                ← Prev
                                            </button>

                                            <div className="flex gap-1 flex-wrap justify-center">
                                                {/* First page */}
                                                {currentPage > 3 && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSearch(1)}
                                                            disabled={isLoading}
                                                            className="w-10 h-10 rounded bg-secondary text-light hover:bg-secondary/80"
                                                        >
                                                            1
                                                        </button>
                                                        {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
                                                    </>
                                                )}

                                                {/* Page range around current page */}
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                                    return pageNum <= totalPages ? pageNum : null;
                                                })
                                                    .filter(Boolean)
                                                    .map(page => (
                                                        <button
                                                            key={page}
                                                            onClick={() => handleSearch(page)}
                                                            disabled={isLoading}
                                                            className={`w-10 h-10 rounded transition-colors ${currentPage === page
                                                                ? 'bg-accent text-primary font-bold'
                                                                : 'bg-secondary text-light hover:bg-secondary/80'
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    ))}

                                                {/* Last page */}
                                                {currentPage < totalPages - 2 && (
                                                    <>
                                                        {currentPage < totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
                                                        <button
                                                            onClick={() => handleSearch(totalPages)}
                                                            disabled={isLoading}
                                                            className="w-10 h-10 rounded bg-secondary text-light hover:bg-secondary/80"
                                                        >
                                                            {totalPages}
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleSearch(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages || isLoading}
                                                className="px-4 py-2 bg-secondary text-light rounded hover:bg-secondary/80 disabled:opacity-50"
                                            >
                                                Next →
                                            </button>

                                            {/* Page info */}
                                            <span className="text-gray-400 text-sm ml-4">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : !isLoading && hasSearched ? (
                                <div className="bg-secondary border border-accent/30 rounded-lg p-12 text-center">
                                    <Film className="text-gray-500 mx-auto mb-4" size={64} />
                                    <p className="text-gray-400 text-lg mb-6">No results found with your filters</p>
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                                    >
                                        <ArrowLeft size={20} />
                                        Go Back
                                    </button>
                                </div>
                            ) : !isLoading ? (
                                <div className="text-center py-16">
                                    <Film className="text-gray-500 mx-auto mb-4" size={64} />
                                    <p className="text-gray-400 text-lg">Use filters and click SEARCH to get the result</p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
