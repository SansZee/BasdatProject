import { Users, Star, Film } from 'lucide-react';
import { ArtistCard as ArtistCardType } from '../../api/artists';

interface Props {
  artist: ArtistCardType;
  onClick?: () => void;
}

export function ArtistCard({ artist, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-6 rounded-lg bg-secondary/40 border-2 border-secondary cursor-pointer transition-all duration-300 hover:border-accent hover:bg-secondary/80 hover:shadow-lg hover:shadow-accent/50"
    >
      {/* Artist Avatar Circle */}
      <div className="flex-shrink-0">
        <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/50 transition-all duration-300">
          <Users className="text-accent transition-colors duration-300" size={40} />
        </div>
      </div>

      {/* Artist Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-light text-lg font-bold mb-1 truncate transition-colors duration-300">
          {artist.primary_name}
        </h4>
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <span className="text-gray-400 text-sm transition-colors duration-300">
            {artist.birth_year ? (
              <>
                Born: {artist.birth_year}
                {artist.death_year && ` - Died: ${artist.death_year}`}
              </>
            ) : (
              'No birth year available'
            )}
          </span>
        </div>

        {/* Stats */}
        {(artist.total_titles !== undefined || artist.avg_rating !== undefined) && (
          <div className="flex flex-wrap gap-3">
            {artist.total_titles !== undefined && artist.total_titles > 0 && (
              <div className="flex items-center gap-1">
                <Film size={14} className="text-accent/60" />
                <span className="text-gray-400 text-xs">
                  {artist.total_titles} {artist.total_titles === 1 ? 'Title' : 'Titles'}
                </span>
              </div>
            )}
            {artist.avg_rating !== undefined && artist.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={14} className="text-accent fill-accent" />
                <span className="text-accent text-xs font-semibold">
                  {artist.avg_rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Icon */}
      <Users className="text-accent/60 flex-shrink-0 hidden sm:block transition-all duration-300" size={24} />
    </div>
  );
}
