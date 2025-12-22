import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface GenreData {
  genre_name: string;
  total_titles: number;
  total_popularity: number;
}

interface Props {
  data: GenreData[];
}

const ProductionGenreChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item.genre_name,
    titles: item.total_titles,
    popularity: parseFloat(item.total_popularity.toFixed(0)),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-secondary border border-accent/30 rounded-lg p-3">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  return (
    <div className="w-full">
      <div className="w-full" style={{ height: '500px', minHeight: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#999' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#999' }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="titles" fill="#3B82F6" name="Number of Titles" radius={[0, 8, 8, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
            <Bar
              dataKey="popularity"
              fill="#10B981"
              name="Total Popularity Score"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartData.map((item, index) => (
          <div
            key={item.name}
            className="p-4 bg-secondary rounded-lg border border-accent/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <h4 className="font-semibold text-light">{item.name}</h4>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Titles: <span className="font-bold text-accent">{item.titles}</span></span>
              <span className="text-gray-400">Popularity: <span className="font-bold text-green-400">{item.popularity}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionGenreChart;
