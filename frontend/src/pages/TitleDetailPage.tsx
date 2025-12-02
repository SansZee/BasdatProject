import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { ArrowLeft, Star, Clock, Calendar, Users } from 'lucide-react';
import { titlesAPI, TitleDetailResponse } from '../api/titles';

export function TitleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        console.error('Failed to fetch title detail:', err);
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
        <div className="max-w-[1600px] mx-auto px-8 py-16">
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

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />

      {/* Header Section */}
      <div className="bg-gradient-to-b from-secondary to-primary py-8">
        <div className="max-w-[1600px] mx-auto px-8">
          <button
            onClick={() => navigate(-1)}
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

              {/* Tagline */}
              {titleDetail.tagline && (
                <p className="text-accent italic text-lg mb-6">
                  "{titleDetail.tagline}"
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                {titleDetail.vote_average && (
                  <div className="flex items-center gap-2">
                    <Star className="text-accent fill-accent" size={20} />
                    <div>
                      <p className="text-gray-400 text-sm">Rating</p>
                      <p className="text-light font-semibold">
                        {titleDetail.vote_average.toFixed(1)}/10
                      </p>
                    </div>
                  </div>
                )}

                {titleDetail.runtime_minutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="text-accent" size={20} />
                    <div>
                      <p className="text-gray-400 text-sm">Runtime</p>
                      <p className="text-light font-semibold">
                        {titleDetail.runtime_minutes} min
                      </p>
                    </div>
                  </div>
                )}

                {titleDetail.start_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="text-accent" size={20} />
                    <div>
                      <p className="text-gray-400 text-sm">Year</p>
                      <p className="text-light font-semibold">
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
                    <Users className="text-accent" size={20} />
                    <div>
                      <p className="text-gray-400 text-sm">Type</p>
                      <p className="text-light font-semibold capitalize">
                        {titleDetail.type}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Seasons/Episodes */}
              <div className="flex gap-4 mb-6">
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
                <p className="text-gray-300 text-lg leading-relaxed">
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
        {detail.genres && detail.genres.length > 0 && (
          <section className="mb-16">
            <h2 className="text-light text-2xl font-bold mb-6">Genres</h2>
            <div className="flex flex-wrap gap-3">
              {detail.genres.map((genre, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-accent/20 border border-accent text-accent rounded-full"
                >
                  {genre.genre_name || 'Unknown'}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {detail.languages && detail.languages.length > 0 && (
          <section className="mb-16">
            <h2 className="text-light text-2xl font-bold mb-6">Languages</h2>
            <div className="flex flex-wrap gap-3">
              {detail.languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-secondary border border-gray-600 text-light rounded"
                >
                  {lang.language_name || 'Unknown'}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Production Countries */}
        {detail.countries && detail.countries.length > 0 && (
          <section className="mb-16">
            <h2 className="text-light text-2xl font-bold mb-6">Production Countries</h2>
            <div className="flex flex-wrap gap-3">
              {detail.countries.map((country, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-secondary border border-gray-600 text-light rounded"
                >
                  {country.country_name || 'Unknown'}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Production Companies */}
        {detail.companies && detail.companies.length > 0 && (
          <section className="mb-16">
            <h2 className="text-light text-2xl font-bold mb-6">Production Companies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detail.companies.map((company, idx) => (
                <div key={idx} className="p-4 bg-secondary border border-gray-600 rounded">
                  <p className="text-light font-semibold">
                    {company.company_name || 'Unknown Company'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Networks */}
        {detail.networks && detail.networks.length > 0 && (
          <section className="mb-16">
            <h2 className="text-light text-2xl font-bold mb-6">Networks</h2>
            <div className="flex flex-wrap gap-3">
              {detail.networks.map((network, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-secondary border border-gray-600 text-light rounded"
                >
                  {network.network_name || 'Unknown'}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Cast & Crew */}
        {detail.cast_and_crew && detail.cast_and_crew.length > 0 && (
          <section className="mb-16">
            <h2 className="text-light text-2xl font-bold mb-6">Cast & Crew</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detail.cast_and_crew.slice(0, 12).map((person, idx) => (
                <div key={idx} className="p-4 bg-secondary border border-gray-600 rounded">
                  <p className="text-light font-semibold">
                    {person.person_name || 'Unknown'}
                  </p>
                  <p className="text-accent text-sm mb-2">
                    {person.job_category || 'Unknown Role'}
                  </p>
                  {person.characters && (
                    <p className="text-gray-400 text-sm italic">
                      as {person.characters}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {detail.cast_and_crew.length > 12 && (
              <p className="text-gray-400 text-center mt-6">
                ... and {detail.cast_and_crew.length - 12} more
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
