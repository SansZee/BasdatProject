import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { ArrowLeft, Star, Clock, Calendar, Users } from 'lucide-react';
import { titlesAPI, TitleDetailResponse } from '../api/titles';

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="bg-gradient-to-b from-secondary to-primary py-8">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-pulse">
            {/* Poster Skeleton */}
            <div className="md:col-span-1">
              <div className="aspect-[2/3] bg-secondary/50 rounded-lg"></div>
            </div>
            {/* Info Skeleton */}
            <div className="md:col-span-3 space-y-4">
              <div className="h-10 bg-secondary/50 rounded w-3/4"></div>
              <div className="h-6 bg-secondary/50 rounded w-1/2"></div>
              <div className="h-6 bg-secondary/50 rounded w-full"></div>
              <div className="h-6 bg-secondary/50 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Component
function ErrorDisplay({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="max-w-[1600px] mx-auto px-8 py-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-accent hover:text-accent/80 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Go Back</span>
        </button>
        <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-6 py-4 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatsSection({ stats }: { stats: StatItem[] }) {
  return (
    <div className="flex flex-wrap gap-6 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {stat.icon}
          <div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-light font-semibold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Section Component (reusable)
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-16">
      <h2 className="text-light text-2xl font-bold mb-6">{title}</h2>
      {children}
    </section>
  );
}

// Cast Card Component
interface CastCardProps {
  name: string;
  role: string;
  character?: string;
}

function CastCard({ name, role, character }: CastCardProps) {
  return (
    <div className="p-4 bg-secondary border border-gray-600 rounded hover:border-accent transition-colors">
      <p className="text-light font-semibold truncate">{name || 'Unknown'}</p>
      <p className="text-accent text-sm mb-2 truncate">{role || 'Unknown Role'}</p>
      {character && <p className="text-gray-400 text-sm italic truncate">as {character}</p>}
    </div>
  );
}

// Main Component
export function TitleDetailPageOptimized() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<TitleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [castExpanded, setCastExpanded] = useState(false);

  // Memoized API call
  useEffect(() => {
    if (!id) {
      setError('Title ID not found');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const fetchDetail = async () => {
      try {
        setError(null);
        const data = await titlesAPI.getTitleDetail(id);
        
        if (!data?.detail) {
          setError('Title not found');
          setDetail(null);
        } else {
          setDetail(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load title details');
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchDetail();

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [id]);

  // Memoized calculations
  const stats = useMemo(() => {
    if (!detail?.detail) return [];

    const statList: StatItem[] = [];

    if (detail.detail.vote_average) {
      statList.push({
        icon: <Star className="text-accent fill-accent" size={20} />,
        label: 'Rating',
        value: `${detail.detail.vote_average.toFixed(1)}/10`,
      });
    }

    if (detail.detail.runtime_minutes) {
      statList.push({
        icon: <Clock className="text-accent" size={20} />,
        label: 'Runtime',
        value: `${detail.detail.runtime_minutes} min`,
      });
    }

    if (detail.detail.start_year) {
      statList.push({
        icon: <Calendar className="text-accent" size={20} />,
        label: 'Year',
        value:
          detail.detail.end_year && detail.detail.end_year !== detail.detail.start_year
            ? `${detail.detail.start_year} - ${detail.detail.end_year}`
            : `${detail.detail.start_year}`,
      });
    }

    if (detail.detail.type) {
      statList.push({
        icon: <Users className="text-accent" size={20} />,
        label: 'Type',
        value: detail.detail.type,
      });
    }

    return statList;
  }, [detail?.detail]);

  const displayedCast = useMemo(() => {
    const cast = detail?.cast_and_crew || [];
    return castExpanded ? cast : cast.slice(0, 12);
  }, [detail?.cast_and_crew, castExpanded]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Loading state
  if (loading) return <LoadingSkeleton />;

  // Error state
  if (error || !detail?.detail) {
    return <ErrorDisplay error={error || 'Title not found'} onBack={handleBack} />;
  }

  const { detail: titleDetail } = detail;

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />

      {/* Header Section */}
      <div className="bg-gradient-to-b from-secondary to-primary py-8">
        <div className="max-w-[1600px] mx-auto px-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-accent hover:text-accent/80 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Poster */}
            <div className="md:col-span-1">
              <div className="aspect-[2/3] bg-secondary/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl text-accent/30 mb-2">🎬</div>
                  <p className="text-gray-400 text-sm">Poster</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-3">
              <h1 className="text-light text-4xl font-bold mb-2">
                {titleDetail.name || 'Unknown Title'}
              </h1>

              {titleDetail.original_name && titleDetail.original_name !== titleDetail.name && (
                <p className="text-gray-400 text-lg mb-4">
                  Original: {titleDetail.original_name}
                </p>
              )}

              {titleDetail.tagline && (
                <p className="text-accent italic text-lg mb-6">
                  "{titleDetail.tagline}"
                </p>
              )}

              {/* Stats */}
              <StatsSection stats={stats} />

              {/* Status & Seasons/Episodes */}
              <div className="flex gap-4 mb-6 flex-wrap">
                {titleDetail.status && (
                  <span className="px-4 py-2 bg-accent/20 border border-accent text-accent rounded font-semibold">
                    {titleDetail.status}
                  </span>
                )}
                {titleDetail.number_of_seasons && (
                  <span className="px-4 py-2 bg-secondary border border-gray-600 text-light rounded">
                    {titleDetail.number_of_seasons} Seasons
                  </span>
                )}
                {titleDetail.number_of_episodes && (
                  <span className="px-4 py-2 bg-secondary border border-gray-600 text-light rounded">
                    {titleDetail.number_of_episodes} Episodes
                  </span>
                )}
              </div>

              {/* Overview */}
              {titleDetail.overview && (
                <p className="text-gray-300 text-lg leading-relaxed line-clamp-4">
                  {titleDetail.overview}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-[1600px] mx-auto px-8 py-16">
        {/* Genres */}
        {detail.genres?.length > 0 && (
          <Section title="Genres">
            <div className="flex flex-wrap gap-3">
              {detail.genres.map((genre, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-accent/20 border border-accent text-accent rounded-full text-sm"
                >
                  {genre.genre_name || 'Unknown'}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Languages */}
        {detail.languages?.length > 0 && (
          <Section title="Languages">
            <div className="flex flex-wrap gap-3">
              {detail.languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-secondary border border-gray-600 text-light rounded text-sm"
                >
                  {lang.language_name || 'Unknown'}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Production Countries */}
        {detail.countries?.length > 0 && (
          <Section title="Production Countries">
            <div className="flex flex-wrap gap-3">
              {detail.countries.map((country, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-secondary border border-gray-600 text-light rounded text-sm"
                >
                  {country.country_name || 'Unknown'}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Production Companies */}
        {detail.companies?.length > 0 && (
          <Section title="Production Companies">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detail.companies.map((company, idx) => (
                <div key={idx} className="p-4 bg-secondary border border-gray-600 rounded hover:border-accent transition-colors">
                  <p className="text-light font-semibold truncate">
                    {company.company_name || 'Unknown Company'}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Networks */}
        {detail.networks?.length > 0 && (
          <Section title="Networks">
            <div className="flex flex-wrap gap-3">
              {detail.networks.map((network, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-secondary border border-gray-600 text-light rounded text-sm"
                >
                  {network.network_name || 'Unknown'}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Cast & Crew */}
        {detail.cast_and_crew?.length > 0 && (
          <Section title="Cast & Crew">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCast.map((person, idx) => (
                <CastCard
                  key={idx}
                  name={person.person_name || 'Unknown'}
                  role={person.job_category || 'Unknown Role'}
                  character={person.characters || undefined}
                />
              ))}
            </div>

            {/* Show More Button */}
            {detail.cast_and_crew.length > 12 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setCastExpanded(!castExpanded)}
                  className="px-6 py-2 bg-accent/20 border border-accent text-accent rounded font-semibold hover:bg-accent/30 transition-colors"
                >
                  {castExpanded
                    ? 'Show Less'
                    : `Show More (${detail.cast_and_crew.length - 12} more)`}
                </button>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}
