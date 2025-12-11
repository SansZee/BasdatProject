import { TitleDetailResponse } from '../../api/titles';

interface InfoSectionProps {
  detail: TitleDetailResponse;
}

export function InfoSection({ detail }: InfoSectionProps) {
  return (
    <div>
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
    </div>
  );
}
