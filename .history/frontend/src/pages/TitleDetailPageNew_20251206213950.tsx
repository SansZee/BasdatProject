import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { Tabs, TabItem } from '../components/Tabs';
import { ReviewSection } from '../components/ReviewSection';
import { ArrowLeft, Star, Clock, Calendar, Users } from 'lucide-react';
import { titlesAPI, TitleDetailResponse } from '../api/titles';

export function TitleDetailPageNew() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [detail, setDetail] = useState<TitleDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) {
                setError('Title ID not found');
                setLoading(false);
                return;
            }

            try {
                setError(null);
                const data = await titlesAPI.getTitleDetail(id);
                setDetail(data);
            } catch (err) {
                console.error('❌ Failed to fetch title detail:', err);
                setError('Failed to load title details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-primary">
                <Navigation />
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-400 text-lg">Loading title details...</p>
                </div>
            </div>
        );
    }

    if (error || !detail || !detail.detail) {
        return (
            <div className="min-h-screen bg-primary">
                <Navigation />
                <div className="max-w-[1400px] mx-auto px-6 py-16">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-accent hover:text-accent/80 mb-8"
                    >
                        <ArrowLeft size={20} />
                        <span>Go Back</span>
                    </button>
                    <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-6 py-4 rounded-lg">
                        {error || 'Title not found'}
                    </div>
                </div>
            </div>
        );
    }

    const titleDetail = detail.detail;

    // Prepare tabs content
    const tabs: TabItem[] = [
      {
        id: 'info',
        label: 'Info',
        content: <InfoTabContent detail={detail} />,
      },
      {
        id: 'cast',
        label: 'Cast & Crew',
        content: <CastTabContent detail={detail} />,
      },
      {
        id: 'reviews',
        label: 'Reviews',
        content: <ReviewsTabContent titleId={id!} />,
      },
    ];

    return (
        <div className="min-h-screen bg-primary">
            <Navigation />

            {/* Compact Header Section */}
            <div className="bg-gradient-to-b from-secondary to-primary py-8 border-b border-gray-600">
                <div className="max-w-[1400px] mx-auto px-6">
                    {/* Back Button */}
                    <button
                        onClick={() => {
                            const state = location.state as any;
                            if (state?.from === 'search') {
                                navigate('/', { 
                                    state: { 
                                        search: state?.query, 
                                        isSearching: false,
                                        returnToSearch: true
                                    } 
                                });
                            } else {
                                navigate(-1);
                            }
                        }}
                        className="flex items-center gap-2 text-accent hover:text-accent/80 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-semibold">Back</span>
                    </button>

                    {/* Header Layout: Poster + Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Poster - Narrower */}
                        <div className="md:col-span-1">
                            <div className="aspect-[2/3] bg-secondary/50 rounded-lg flex items-center justify-center sticky top-20">
                                <div className="text-center">
                                    <div className="text-6xl text-accent/30 mb-2">🎬</div>
                                    <p className="text-gray-400 text-sm">Poster</p>
                                </div>
                            </div>
                        </div>

                        {/* Title Info */}
                        <div className="md:col-span-2">
                            {/* Title & Original Name */}
                            <h1 className="text-light text-4xl font-bold mb-1">
                                {titleDetail.name || 'Unknown Title'}
                            </h1>

                            {titleDetail.original_name && titleDetail.original_name !== titleDetail.name && (
                                <p className="text-gray-400 text-sm mb-4">
                                    Original: {titleDetail.original_name}
                                </p>
                            )}

                            {/* Tagline */}
                            {titleDetail.tagline && (
                                <p className="text-accent italic text-base mb-6 line-clamp-2">
                                    "{titleDetail.tagline}"
                                </p>
                            )}

                            {/* Stats Grid - 2x2 Compact */}
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                                {titleDetail.vote_average && (
                                    <div className="flex items-center gap-2">
                                        <Star className="text-accent fill-accent flex-shrink-0" size={18} />
                                        <div className="min-w-0">
                                            <p className="text-gray-400 text-xs">Rating</p>
                                            <p className="text-light font-semibold text-sm">
                                                {titleDetail.vote_average.toFixed(1)}/10
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {titleDetail.runtime_minutes && titleDetail.runtime_minutes > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="text-accent flex-shrink-0" size={18} />
                                        <div className="min-w-0">
                                            <p className="text-gray-400 text-xs">Runtime</p>
                                            <p className="text-light font-semibold text-sm">
                                                {titleDetail.runtime_minutes} min
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {titleDetail.start_year && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-accent flex-shrink-0" size={18} />
                                        <div className="min-w-0">
                                            <p className="text-gray-400 text-xs">Year</p>
                                            <p className="text-light font-semibold text-sm">
                                                {titleDetail.start_year}
                                                {titleDetail.end_year && titleDetail.end_year !== titleDetail.start_year
                                                    ? ` - ${titleDetail.end_year}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {titleDetail.type && (
                                    <div className="flex items-center gap-2">
                                        <Users className="text-accent flex-shrink-0" size={18} />
                                        <div className="min-w-0">
                                            <p className="text-gray-400 text-xs">Type</p>
                                            <p className="text-light font-semibold text-sm capitalize">
                                                {titleDetail.type}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status & Seasons/Episodes - Compact Chips */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {titleDetail.status && (
                                    <span className="px-3 py-1 bg-accent/20 border border-accent text-accent rounded-full text-sm font-semibold">
                                        {titleDetail.status}
                                    </span>
                                )}
                                {titleDetail.number_of_seasons && (
                                    <span className="px-3 py-1 bg-secondary border border-gray-600 text-light rounded-full text-sm">
                                        {titleDetail.number_of_seasons} Season{titleDetail.number_of_seasons !== 1 ? 's' : ''}
                                    </span>
                                )}
                                {titleDetail.number_of_episodes && (
                                    <span className="px-3 py-1 bg-secondary border border-gray-600 text-light rounded-full text-sm">
                                        {titleDetail.number_of_episodes} Episode{titleDetail.number_of_episodes !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {/* Overview - Truncated */}
                            {titleDetail.overview && (
                              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                                {titleDetail.overview}
                              </p>
                            )}

                            {/* Genres - After Overview */}
                            {detail.genres && detail.genres.length > 0 && (
                              <div className="mt-6">
                                <div className="flex flex-wrap gap-2">
                                  {detail.genres.map((genre, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-accent/20 border border-accent text-accent rounded-full text-sm"
                                    >
                                      {genre.genre_name || 'Unknown'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            </div>
                            </div>
                            </div>
                            </div>

            {/* Tabbed Content Section */}
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                <Tabs tabs={tabs} defaultTab="info" />
            </div>
        </div>
    );
}

// ==================== TAB COMPONENTS ====================

function InfoTabContent({ detail }: { detail: TitleDetailResponse }) {
  return (
    <div className="space-y-8">
      {/* Languages, Countries, Networks - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Languages */}
        {detail.languages && detail.languages.length > 0 && (
          <section>
            <h3 className="text-light text-lg font-bold mb-4">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {detail.languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-secondary border border-gray-600 text-light rounded-full text-sm"
                >
                  {lang.language_name || 'Unknown'}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Production Countries */}
        {detail.countries && detail.countries.length > 0 && (
          <section>
            <h3 className="text-light text-lg font-bold mb-4">Production Countries</h3>
            <div className="flex flex-wrap gap-2">
              {detail.countries.map((country, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-secondary border border-gray-600 text-light rounded-full text-sm"
                >
                  {country.country_name || 'Unknown'}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Networks */}
        {detail.networks && detail.networks.length > 0 && (
          <section>
            <h3 className="text-light text-lg font-bold mb-4">Networks</h3>
            <div className="flex flex-wrap gap-2">
              {detail.networks.map((network, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-secondary border border-gray-600 text-light rounded-full text-sm"
                >
                  {network.network_name || 'Unknown'}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Production Companies */}
      {detail.companies && detail.companies.length > 0 && (
        <section>
          <h3 className="text-light text-lg font-bold mb-4">Production Companies</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {detail.companies.map((company, idx) => (
              <div key={idx} className="p-4 bg-secondary border border-gray-600 rounded-lg">
                <p className="text-light font-semibold text-sm">
                  {company.company_name || 'Unknown Company'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CastTabContent({ detail }: { detail: TitleDetailResponse }) {
    const [showAll, setShowAll] = useState(false);

    const displayedCast = showAll
        ? detail.cast_and_crew
        : detail.cast_and_crew?.slice(0, 8) || [];
    const hiddenCount = (detail.cast_and_crew?.length || 0) - 8;

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayedCast.map((person, idx) => (
                    <div
                        key={idx}
                        className="p-4 bg-secondary border border-gray-600 rounded-lg hover:border-accent/50 transition-colors"
                    >
                        <p className="text-light font-semibold text-sm line-clamp-2">
                            {person.person_name || 'Unknown'}
                        </p>
                        <p className="text-accent text-xs mb-2 mt-1">
                            {person.job_category || 'Unknown Role'}
                        </p>
                        {person.characters && (
                            <p className="text-gray-400 text-xs italic line-clamp-1">
                                as {person.characters}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* View All / Show Less Button */}
            {hiddenCount > 0 && !showAll && (
                <div className="text-center mt-6">
                    <button
                        onClick={() => setShowAll(true)}
                        className="px-6 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                    >
                        View All {hiddenCount + 8} Cast & Crew
                    </button>
                </div>
            )}

            {showAll && hiddenCount > 0 && (
                <div className="text-center mt-6">
                    <button
                        onClick={() => setShowAll(false)}
                        className="px-6 py-2 bg-secondary border border-gray-600 text-light font-semibold rounded-lg hover:border-gray-400 transition-colors"
                    >
                        Show Less
                    </button>
                </div>
            )}
        </div>
    );
}

function ReviewsTabContent({ titleId }: { titleId: string }) {
    return <ReviewSection titleId={titleId} />;
}


