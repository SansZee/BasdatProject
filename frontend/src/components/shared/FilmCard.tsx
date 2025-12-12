import { useNavigate } from 'react-router-dom';
import { Star, Film } from 'lucide-react';

interface FilmCardProps {
  titleId: string;
  name: string;
  year?: number | null;
  genre?: string | null;
  rating?: number | null;
  onNavigate?: (titleId: string) => void; // Optional custom navigation handler
}

export function FilmCard({ 
  titleId, 
  name, 
  year, 
  genre, 
  rating,
  onNavigate 
}: FilmCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(titleId);
    } else {
      navigate(`/titles/${titleId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="card hover:border-accent transition-colors cursor-pointer group"
    >
      {/* Poster Placeholder */}
      <div className="aspect-[2/3] bg-secondary/50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-secondary transition-colors">
        <Film className="text-accent" size={48} />
      </div>

      {/* Title */}
      <h4 className="text-light font-semibold mb-1 line-clamp-2 text-sm h-10">
        {name || 'Unknown Title'}
      </h4>

      {/* Year & Genre - Fixed height for consistency */}
      <p className="text-gray-400 text-xs mb-2 h-4 truncate">
        {year && year}
        {year && genre && ' • '}
        {genre}
      </p>

      {/* Rating */}
      {rating !== undefined && rating !== null && (
        <div className="flex items-center gap-1">
          <Star className="text-accent fill-accent" size={16} />
          <span className="text-accent font-semibold text-sm">
            {rating.toFixed(1)}
          </span>
        </div>
      )}
    </div>
  );
}
