import { FilmCard } from './shared/FilmCard';
import { FilteredTitle } from '../api/titles';

interface FilterResultCardProps {
  title: FilteredTitle;
}

export function FilterResultCard({ title }: FilterResultCardProps) {
  return (
    <FilmCard
      titleId={title.title_id}
      name={title.name}
      year={title.start_year}
      rating={title.vote_average}
    />
  );
}
