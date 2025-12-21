import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { executiveAPI, GenreTrend } from '../../api/executive';

interface Props {
  companyID: string;
}

interface ChartData {
  year: number;
  [key: string]: number;
}

export function GenreTrendChart({ companyID }: Props) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const trends = await executiveAPI.getGenreTrend(companyID);
        
        // Transform data for line chart: group by year, genres as lines
        const grouped: { [key: number]: { [key: string]: number } } = {};
        
        trends.forEach((trend: GenreTrend) => {
          if (!grouped[trend.start_year]) {
            grouped[trend.start_year] = { year: trend.start_year };
          }
          grouped[trend.start_year][trend.genre_name] = trend.total_votes;
        });

        const chartData = Object.values(grouped).sort((a, b) => a.year - b.year);
        setData(chartData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch genre trend');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (companyID) {
      fetchData();
    }
  }, [companyID]);

  if (loading) {
    return <div className="h-80 flex items-center justify-center text-light/60">Loading...</div>;
  }

  if (error) {
    return <div className="h-80 flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-light/60">No data available</div>;
  }

  // Get unique genres (excluding 'year')
  const genres = Object.keys(data[0]).filter(key => key !== 'year');
  const colors = ['#00B8CC', '#B8669C', '#CC9966', '#669999', '#7A6B99', '#996699'];

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#404758" />
        <XAxis 
          dataKey="year" 
          stroke="#A0AEC0"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#A0AEC0"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1a202c',
            border: '1px solid #00D9FF',
            borderRadius: '8px',
            color: '#fff'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        {genres.map((genre, idx) => (
          <Line
            key={genre}
            type="monotone"
            dataKey={genre}
            stroke={colors[idx % colors.length]}
            strokeWidth={2}
            dot={{ fill: colors[idx % colors.length], r: 4 }}
            activeDot={{ r: 6 }}
            name={genre}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
