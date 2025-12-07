interface CastCrewMember {
  person_name?: string;
  job_category?: string;
  characters?: string;
}

interface CastCrewSectionProps {
  castAndCrew?: CastCrewMember[];
}

export function CastCrewSection({ castAndCrew = [] }: CastCrewSectionProps) {
  if (!castAndCrew || castAndCrew.length === 0) {
    return (
      <div className="text-center py-8 bg-secondary/50 rounded-lg">
        <p className="text-gray-400">No cast and crew information available.</p>
      </div>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {castAndCrew.slice(0, 12).map((person, idx) => (
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
      {castAndCrew.length > 12 && (
        <p className="text-gray-400 text-center mt-6">
          ... and {castAndCrew.length - 12} more
        </p>
      )}
    </section>
  );
}
