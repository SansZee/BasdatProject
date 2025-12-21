import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { executiveAPI, SummaryTrendItem } from '../../api/executive';

interface Props {
  companyID: string;
  yearRange?: number;
}

export function SummaryTrendChart({ companyID, yearRange = 5 }: Props) {
  const [data, setData] = useState<SummaryTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const trends = await executiveAPI.getSummaryTrend(companyID, yearRange);
        setData(trends);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch summary trend');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (companyID) {
      fetchData();
    }
  }, [companyID, yearRange]);

  if (loading) {
    return <div className="h-80 flex items-center justify-center text-light/60">Loading...</div>;
  }

  if (error) {
    return <div className="h-80 flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (data.length === 0) {
    return <div className="h-80 flex items-center justify-center text-light/60">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#404758" />
        <XAxis
          dataKey="production_year"
          stroke="#A0AEC0"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          yAxisId="left"
          stroke="#A0AEC0"
          style={{ fontSize: '12px' }}
          label={{ value: 'Total Production', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#A0AEC0"
          style={{ fontSize: '12px' }}
          label={{ value: 'Avg Rating', angle: 90, position: 'insideRight' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a202c',
            border: '1px solid #00D9FF',
            borderRadius: '8px',
            color: '#fff',
          }}
          formatter={(value: any) => {
            if (typeof value === 'number') {
              return value.toFixed(2);
            }
            return value;
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar
          yAxisId="left"
          dataKey="total_production"
          fill="#00B8CC"
          name="Total Production"
          radius={[8, 8, 0, 0]}
          opacity={0.8}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avg_rating"
          stroke="#B8669C"
          strokeWidth={3}
          name="Average Rating"
          dot={{ fill: '#B8669C', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
