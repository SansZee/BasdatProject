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

interface CompanyData {
  company_id: string;
  company_name: string;
  total_titles: number;
  in_production_count: number;
  planned_count: number;
  avg_rating: number;
}

interface Props {
  data: CompanyData[];
}

const ProductionTopCompaniesChart: React.FC<Props> = ({ data }) => {
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.company_name.length > 15 ? item.company_name.substring(0, 12) + '...' : item.company_name,
    fullName: item.company_name,
    total: item.total_titles,
    inProduction: item.in_production_count,
    planned: item.planned_count,
    avgRating: parseFloat(item.avg_rating.toFixed(1)),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-secondary border border-accent/30 rounded-lg p-3">
          <p className="text-light font-semibold">{data.fullName}</p>
          <p className="text-blue-400">Total: {data.total}</p>
          <p className="text-green-400">In Production: {data.inProduction}</p>
          <p className="text-yellow-400">Planned: {data.planned}</p>
          <p className="text-purple-400">Avg Rating: {data.avgRating}</p>
        </div>
      );
    }
    return null;
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#EC4899'];

  return (
    <div className="w-full">
      <div className="w-full" style={{ height: '400px', minHeight: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#999' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#999' }}
              label={{ value: 'Number of Titles', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="total" fill="#3B82F6" name="Total Titles" radius={[8, 8, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
            <Bar dataKey="inProduction" fill="#10B981" name="In Production" radius={[8, 8, 0, 0]} />
            <Bar dataKey="planned" fill="#F59E0B" name="Planned" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-3">
          {chartData.slice(0, 5).map((item, index) => (
            <div key={item.fullName} className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-accent/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div>
                  <p className="font-semibold text-light">{item.fullName}</p>
                  <p className="text-xs text-gray-400">Rating: {item.avgRating}/10</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">{item.total}</p>
                <p className="text-xs text-gray-400">titles</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionTopCompaniesChart;
