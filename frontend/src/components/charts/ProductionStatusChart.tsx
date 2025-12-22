import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StatusData {
  status_id: string;
  status_name: string;
  total_titles: number;
}

interface Props {
  data: StatusData[];
  onStatusClick?: (statusId: string, statusName: string) => void;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const ProductionStatusChart: React.FC<Props> = ({ data, onStatusClick }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = data.map((item) => ({
    name: item.status_name,
    value: item.total_titles,
    statusId: item.status_id,
  }));

  const handleClick = (index: number) => {
    const item = data[index];
    if (onStatusClick) {
      onStatusClick(item.status_id, item.status_name);
    }
    setActiveIndex(index);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-secondary border border-accent/30 rounded-lg p-3">
          <p className="text-light font-semibold">{data.name}</p>
          <p className="text-accent">Titles: {data.value}</p>
          <p className="text-green-400">Percentage: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="w-full" style={{ height: '400px', minHeight: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              onClick={(_, index) => handleClick(index)}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(_, entry) => (
                <span style={{ color: '#ccc' }}>{entry.payload.name}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6">
        {chartData.map((item, index) => (
          <div
            key={item.statusId}
            onClick={() => handleClick(index)}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
              activeIndex === index
                ? 'border-accent bg-accent/10'
                : 'border-accent/20 hover:border-accent/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs font-medium text-light">{item.name}</span>
            </div>
            <p className="text-lg font-bold text-accent">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionStatusChart;
