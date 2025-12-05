import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { FilterResultCard } from '../components/FilterResultCard';
import { Film, Home } from 'lucide-react';
import { titlesAPI, FilterRequest, FilteredTitle, FilterOptionsResponse } from '../api/titles';

const SORT_OPTIONS = [
    { id: 'released', label: 'Release Date' },
    { id: 'popularity', label: 'Most Viewed' },
    { id: 'name', label: 'Name' },
    { id: 'rating', label: 'IMDb Rating' },
];

export function AdvancedSearchPage() {
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

    // Filter states
    const [filters, setFilters] = useState({
        genreId: null as string | null,
        typeId: null as string | null,
        statusId: null as string | null,
        year: null as number | null,
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
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to page 1 when filter changes
    };

    const handleSearch = async (page: number = 1) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const filterRequest: FilterRequest = {
                genreId: filters.genreId,
                typeId: filters.typeId,
                statusId: filters.statusId,
                originCountryId: null,
                productionCountryId: null,
                year: filters.year,
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
            <Navigation />

            {/* Header */}
            <div className="bg-gradient-to-b from-secondary to-primary py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-light text-4xl font-bold mb-3">Advanced Search</h1>
                    <p className="text-gray-400">Find movies and series with filters</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-12 bg-primary">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filter Panel */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-20 bg-secondary rounded-lg border border-accent/20 p-6">
                                <h2 className="text-light text-xl font-bold mb-6">Filters</h2>

                                {/* Genre */}
                                <div className="mb-6">
                                    <label className="block text-light font-semibold mb-3">Genre</label>
                                    <select
                                        value={filters.genreId || ''}
                                        onChange={(e) => handleFilterChange('genreId', e.target.value || null)}
                                        className="w-full bg-primary text-light border border-gray-600 rounded px-3 py-2 disabled:opacity-50"
                                        disabled={isLoadingOptions}
                                    >
                                        <option value="">All Genres</option>
                                        {filterOptions?.genres.map(g => (
                                            <option key={g.genre_type_id} value={g.genre_type_id}>{g.genre_name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type */}
                                <div className="mb-6">
                                    <label className="block text-light font-semibold mb-3">Type</label>
                                    <select
                                        value={filters.typeId || ''}
                                        onChange={(e) => handleFilterChange('typeId', e.target.value || null)}
                                        className="w-full bg-primary text-light border border-gray-600 rounded px-3 py-2 disabled:opacity-50"
                                        disabled={isLoadingOptions}
                                    >
                                        <option value="">All Types</option>
                                        {filterOptions?.types.map(t => (
                                            <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="mb-6">
                                    <label className="block text-light font-semibold mb-3">Status</label>
                                    <select
                                        value={filters.statusId || ''}
                                        onChange={(e) => handleFilterChange('statusId', e.target.value || null)}
                                        className="w-full bg-primary text-light border border-gray-600 rounded px-3 py-2 disabled:opacity-50"
                                        disabled={isLoadingOptions}
                                    >
                                        <option value="">All Status</option>
                                        {filterOptions?.statuses.map(s => (
                                            <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year */}
                                <div className="mb-6">
                                    <label className="block text-light font-semibold mb-3">Year</label>
                                    <select
                                        value={filters.year || ''}
                                        onChange={(e) => handleFilterChange('year', e.target.value ? Number(e.target.value) : null)}
                                        className="w-full bg-primary text-light border border-gray-600 rounded px-3 py-2 disabled:opacity-50"
                                        disabled={isLoadingOptions}
                                    >
                                        <option value="">All Years</option>
                                        {filterOptions?.years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
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
                            {error && (
                                <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-lg mb-6">
                                    {error}
                                </div>
                            )}

                            {hasSearched && results.length > 0 ? (
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
                            ) : hasSearched ? (
                                <div className="bg-secondary border border-accent/30 rounded-lg p-12 text-center">
                                    <Film className="text-gray-500 mx-auto mb-4" size={64} />
                                    <p className="text-gray-400 text-lg mb-6">No results found with your filters</p>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                                    >
                                        <Home size={20} />
                                        Back to Home
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Film className="text-gray-500 mx-auto mb-4" size={64} />
                                    <p className="text-gray-400 text-lg">Use filters above and click SEARCH to find titles</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
