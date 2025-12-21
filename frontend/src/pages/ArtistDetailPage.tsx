import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { FilmCard } from '../components/shared/FilmCard';
import { ArrowLeft, Users, Calendar, Award, Film, Loader, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { artistsAPI, ArtistDetail } from '../api/artists';

export function ArtistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [artistDetail, setArtistDetail] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllTitles, setShowAllTitles] = useState(false);
  const [titlesSearchQuery, setTitlesSearchQuery] = useState('');

  useEffect(() => {
    const fetchArtistDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await artistsAPI.getArtistDetail(id);
        setArtistDetail(data);
      } catch (err) {
        console.error('Failed to fetch artist detail:', err);
        setError('Failed to load artist details');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full bg-primary min-h-screen">
        <nav className="relative z-40">
          <Navigation />
        </nav>
        <div className="flex items-center justify-center h-screen pt-20">
          <div className="text-center">
            <Loader className="animate-spin text-accent mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">Loading artist details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artistDetail) {
    return (
      <div className="w-full bg-primary min-h-screen">
        <nav className="relative z-40">
          <Navigation />
        </nav>
        <div className="pt-24 max-w-[1600px] mx-auto px-8">
          <button
            onClick={() => {
              const state = location.state as any;
              if (state?.from === 'search' && state?.query) {
                navigate('/', {
                  state: {
                    returnToSearch: true,
                    search: state.query,
                    searchMode: state.mode || 'artist'
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
          <div className="bg-secondary rounded-lg p-8 text-center">
            <p className="text-red-500 text-lg">{error || 'Artist not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-primary">
      <nav className="relative z-40">
        <Navigation />
      </nav>

      {/* Header Section */}
      <div className="bg-gradient-to-b from-secondary/60 to-secondary/20 pt-24 pb-12">
        <div className="max-w-[1600px] mx-auto px-8">
          <button
            onClick={() => {
              const state = location.state as any;
              if (state?.from === 'search' && state?.query) {
                navigate('/', {
                  state: {
                    returnToSearch: true,
                    search: state.query,
                    searchMode: state.mode || 'artist'
                  }
                });
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 text-accent hover:text-accent/80 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex gap-8 items-start">
            {/* Artist Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/50 flex items-center justify-center">
                <Users className="text-accent" size={64} />
              </div>
            </div>

            {/* Artist Info */}
            <div className="flex-1">
              <h1 className="text-light text-4xl font-bold mb-4">
                {artistDetail.primary_name}
              </h1>

              <div className="flex flex-wrap gap-6 mb-6">
                {artistDetail.birth_year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="text-accent" size={20} />
                    <span className="text-gray-300">
                      Born {artistDetail.birth_year}
                      {artistDetail.death_year && ` - Died ${artistDetail.death_year}`}
                    </span>
                  </div>
                )}

                {artistDetail.total_titles > 0 && (
                  <div className="flex items-center gap-2">
                    <Film className="text-accent" size={20} />
                    <span className="text-gray-300">
                      {artistDetail.total_titles} {artistDetail.total_titles === 1 ? 'Project' : 'Projects'}
                    </span>
                  </div>
                )}
              </div>

              {/* Professions */}
              {artistDetail.professions && artistDetail.professions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {artistDetail.professions.map((profession, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-semibold border border-accent/50"
                    >
                      {profession}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-primary py-12">
        <div className="max-w-[1600px] mx-auto px-8">
          {/* Known For Section */}
          {artistDetail.known_for && artistDetail.known_for.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-accent rounded"></div>
                <h2 className="text-light text-3xl font-bold">Known For</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {artistDetail.known_for.map((title) => (
                  <FilmCard
                    key={title.title_id}
                    titleId={title.title_id}
                    name={title.name}
                    year={title.start_year}
                    rating={title.vote_average}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Titles Section */}
          {artistDetail.all_titles && artistDetail.all_titles.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-accent rounded"></div>
                <h2 className="text-light text-3xl font-bold">All Titles</h2>
              </div>

              {/* Search Titles */}
              <div className="mb-6 relative">
                <Search className="absolute left-4 top-3 text-accent/60" size={20} />
                <input
                  type="text"
                  placeholder="Search titles..."
                  value={titlesSearchQuery}
                  onChange={(e) => setTitlesSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-2 bg-secondary/50 border border-accent/20 rounded-lg text-light placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                />
                {titlesSearchQuery && (
                  <button
                    onClick={() => setTitlesSearchQuery('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-accent transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Filtered Results Info */}
              {titlesSearchQuery && (
                <div className="mb-4 text-sm text-gray-400">
                  Found {artistDetail.all_titles.filter(t => 
                    t.name.toLowerCase().includes(titlesSearchQuery.toLowerCase()) ||
                    t.job?.toLowerCase().includes(titlesSearchQuery.toLowerCase()) ||
                    t.category?.toLowerCase().includes(titlesSearchQuery.toLowerCase()) ||
                    t.characters?.toLowerCase().includes(titlesSearchQuery.toLowerCase())
                  ).length} results
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-accent/20">
                      <th className="text-left py-4 px-4 text-accent font-semibold w-12">No</th>
                      <th className="text-left py-4 px-4 text-accent font-semibold">Title</th>
                      <th className="text-left py-4 px-4 text-accent font-semibold">Year</th>
                      <th className="text-left py-4 px-4 text-accent font-semibold">Role</th>
                      <th className="text-left py-4 px-4 text-accent font-semibold">Category</th>
                      <th className="text-left py-4 px-4 text-accent font-semibold">Character</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artistDetail.all_titles
                      .filter(t => 
                        !titlesSearchQuery ||
                        t.name.toLowerCase().includes(titlesSearchQuery.toLowerCase()) ||
                        t.job?.toLowerCase().includes(titlesSearchQuery.toLowerCase()) ||
                        t.category?.toLowerCase().includes(titlesSearchQuery.toLowerCase()) ||
                        t.characters?.toLowerCase().includes(titlesSearchQuery.toLowerCase())
                      )
                      .slice(0, 20)
                      .map((title, index) => (
                      <tr
                        key={`${title.title_id}-${index}`}
                        className="border-b border-secondary hover:bg-secondary/40 transition-colors cursor-pointer"
                        onClick={() => navigate(`/titles/${title.title_id}`)}
                      >
                        <td className="py-4 px-4 text-gray-400 text-sm font-semibold text-center">
                          {index + 1}
                        </td>
                        <td className="py-4 px-4 text-light font-semibold hover:text-accent transition-colors line-clamp-2">
                          {title.name}
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {title.start_year || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {title.job || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {title.category || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm line-clamp-2">
                          {title.characters || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(() => {
                const filteredTitles = artistDetail.all_titles.filter(t => 
                  !titlesSearchQuery ||
                  t.name.toLowerCase().includes(titlesSearchQuery.toLowerCase()) ||
                  t.job?.toLowerCase().includes(titlesSearchQuery.toLowerCase()) ||
                  t.category?.toLowerCase().includes(titlesSearchQuery.toLowerCase()) ||
                  t.characters?.toLowerCase().includes(titlesSearchQuery.toLowerCase())
                );
                
                return filteredTitles.length > 20 && (
                  <>
                    <button
                      onClick={() => setShowAllTitles(!showAllTitles)}
                      className="mt-6 flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-semibold"
                    >
                      {showAllTitles ? (
                        <>
                          <ChevronUp size={20} />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={20} />
                          Show More ({filteredTitles.length - 20} more)
                        </>
                      )}
                    </button>

                    {showAllTitles && (
                       <div className="mt-6 overflow-x-auto">
                         <table className="w-full">
                           <thead>
                             <tr className="border-b border-accent/20">
                               <th className="text-left py-4 px-4 text-accent font-semibold w-12">No</th>
                               <th className="text-left py-4 px-4 text-accent font-semibold">Title</th>
                               <th className="text-left py-4 px-4 text-accent font-semibold">Year</th>
                               <th className="text-left py-4 px-4 text-accent font-semibold">Role</th>
                               <th className="text-left py-4 px-4 text-accent font-semibold">Category</th>
                               <th className="text-left py-4 px-4 text-accent font-semibold">Character</th>
                             </tr>
                           </thead>
                           <tbody>
                             {filteredTitles.slice(20).map((title, index) => (
                             <tr
                               key={`${title.title_id}-${index + 20}`}
                               className="border-b border-secondary hover:bg-secondary/40 transition-colors cursor-pointer"
                               onClick={() => navigate(`/titles/${title.title_id}`)}
                             >
                               <td className="py-4 px-4 text-gray-400 text-sm font-semibold text-center">
                                 {index + 21}
                               </td>
                               <td className="py-4 px-4 text-light font-semibold hover:text-accent transition-colors line-clamp-2">
                                 {title.name}
                               </td>
                               <td className="py-4 px-4 text-gray-400 text-sm">
                                 {title.start_year || 'N/A'}
                               </td>
                               <td className="py-4 px-4 text-gray-400 text-sm">
                                 {title.job || 'N/A'}
                               </td>
                               <td className="py-4 px-4 text-gray-400 text-sm">
                                 {title.category || 'N/A'}
                               </td>
                               <td className="py-4 px-4 text-gray-400 text-sm line-clamp-2">
                                 {title.characters || 'N/A'}
                               </td>
                             </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                        </>
                        );
                        })()}
                        </div>
                        )}

          {/* Empty State */}
          {(!artistDetail.known_for || artistDetail.known_for.length === 0) &&
            (!artistDetail.all_titles || artistDetail.all_titles.length === 0) && (
              <div className="bg-secondary/40 rounded-lg p-12 text-center border border-accent/20">
                <Film className="text-gray-500 mx-auto mb-4" size={64} />
                <p className="text-gray-400 text-lg">No titles found for this artist</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
