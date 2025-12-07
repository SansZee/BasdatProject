import { useNavigate } from 'react-router-dom';
import { Star, Film } from 'lucide-react';
import { FilteredTitle } from '../api/titles';

interface FilterResultCardProps {
  title: FilteredTitle;
}

export function FilterResultCard({ title }: FilterResultCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/titles/${title.title_id}`);
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
        {title.name}
      </h4>

      {/* Year */}
      <p className="text-gray-400 text-xs mb-2">
        {title.start_year && title.start_year}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-1">
        <Star className="text-accent fill-accent" size={16} />
        <span className="text-accent font-semibold text-sm">
          {title.vote_average ? title.vote_average.toFixed(1) : 'N/A'}
        </span>
      </div>
    </div>
  );
}
