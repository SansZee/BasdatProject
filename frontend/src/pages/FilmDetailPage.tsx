import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { ArrowLeft, Star, Zap, Users, FileText } from 'lucide-react';
import { titlesAPI, FilmDetail } from '../api/titles';

export function FilmDetailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const titleId = searchParams.get('id');

  const [film, setFilm] = useState<FilmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!titleId) {
      setError('Film ID not provided');
      setLoading(false);
      return;
    }

    const fetchFilmDetail = async () => {
      try {
        setError(null);
        setLoading(true);
        const filmData = await titlesAPI.getFilmDetail(titleId);
        setFilm(filmData);
      } catch (err) {
        console.error('Failed to fetch film details:', err);
        setError('Failed to load film details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilmDetail();
  }, [titleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="min-h-screen bg-primary">
        <Navigation />
        <div className="max-w-[1600px] mx-auto px-8 py-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-accent hover:text-accent/70 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-6 py-4 rounded-lg">
            {error || 'Film not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />

      {/* Back Button */}
      <div className="max-w-[1600px] mx-auto px-8 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-accent hover:text-accent/70 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>

      {/* Film Detail */}
      <div className="bg-gradient-to-b from-secondary to-primary py-12">
        <div className="max-w-[1600px] mx-auto px-8">
          {/* Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Poster Placeholder */}
            <div className="hidden md:flex md:col-span-1 items-center justify-center">
              <div className="aspect-[2/3] bg-secondary/50 rounded-lg flex items-center justify-center w-full">
                <div className="text-center">
                  <div className="text-accent text-4xl mb-2">🎬</div>
                  <p className="text-gray-400 text-sm">No poster</p>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="md:col-span-3 space-y-6">
              {/* Title & Year */}
              <div>
                <h1 className="text-light text-4xl md:text-5xl font-bold mb-2">
                  {film.name}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-gray-400">
                    {film.start_year}
                    {film.end_year && ` - ${film.end_year}`}
                  </span>
                  {film.runtime && (
                    <span className="text-gray-400">
                      {Math.floor(film.runtime / 60)}h {film.runtime % 60}m
                    </span>
                  )}
                </div>
              </div>

              {/* Genres */}
              {film.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {film.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm border border-accent/30"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="text-accent fill-accent" size={24} />
                  <div>
                    <p className="text-2xl font-bold text-accent">
                      {film.vote_average.toFixed(1)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {film.vote_count.toLocaleString()} votes
                    </p>
                  </div>
                </div>
              </div>

              {/* Directors */}
              {film.directors.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Directed by</p>
                  <p className="text-light text-lg">
                    {film.directors.join(', ')}
                  </p>
                </div>
              )}

              {/* Writers */}
              {film.writers.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Written by</p>
                  <p className="text-light text-lg">
                    {film.writers.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Synopsis */}
          {film.synopsis && (
            <div className="bg-secondary/30 rounded-lg p-6 mb-12 border border-accent/10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="text-accent" size={24} />
                <h2 className="text-light text-2xl font-bold">Synopsis</h2>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">
                {film.synopsis}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cast Section */}
      {film.cast.length > 0 && (
        <div className="py-12 bg-secondary">
          <div className="max-w-[1600px] mx-auto px-8">
            <div className="flex items-center gap-3 mb-8">
              <Users className="text-accent" size={32} />
              <h2 className="text-light text-3xl font-bold">Cast</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {film.cast.map((actor) => (
                <div
                  key={actor.actor_id}
                  className="card hover:border-accent transition-colors group"
                >
                  {/* Actor Photo Placeholder */}
                  <div className="aspect-[3/4] bg-primary/50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-primary/70 transition-colors">
                    <div className="text-center">
                      <div className="text-2xl mb-2">👤</div>
                      <p className="text-gray-400 text-xs">No photo</p>
                    </div>
                  </div>

                  {/* Actor Info */}
                  <h3 className="text-light font-semibold text-sm line-clamp-2 mb-1">
                    {actor.name}
                  </h3>

                  {actor.country && (
                    <p className="text-gray-400 text-xs mb-2">{actor.country}</p>
                  )}

                  {actor.birth_date && (
                    <p className="text-gray-400 text-xs">
                      Born: {new Date(actor.birth_date).toLocaleDateString()}
                    </p>
                  )}

                  {/* Bio Preview */}
                  {actor.biography && (
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2">
                      {actor.biography}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="py-12 bg-primary">
        <div className="max-w-[1600px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Info Card: Rating */}
            <div className="card border-accent/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="text-accent fill-accent" size={24} />
                <h3 className="text-light font-semibold">Rating</h3>
              </div>
              <p className="text-3xl font-bold text-accent mb-2">
                {film.vote_average.toFixed(1)}/10
              </p>
              <p className="text-gray-400 text-sm">
                Based on {film.vote_count.toLocaleString()} votes
              </p>
            </div>

            {/* Info Card: Year */}
            <div className="card border-accent/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-accent" size={24} />
                <h3 className="text-light font-semibold">Year</h3>
              </div>
              <p className="text-3xl font-bold text-accent">
                {film.start_year}
              </p>
              {film.end_year && (
                <p className="text-gray-400 text-sm">to {film.end_year}</p>
              )}
            </div>

            {/* Info Card: Genres */}
            <div className="card border-accent/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-accent" size={24} />
                <h3 className="text-light font-semibold">Genres</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {film.genres.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="bg-accent/10 text-accent px-2 py-1 rounded text-xs border border-accent/30"
                  >
                    {genre}
                  </span>
                ))}
                {film.genres.length > 3 && (
                  <span className="text-gray-400 text-xs self-center">
                    +{film.genres.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
