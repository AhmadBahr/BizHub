import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', sales: 4000, leads: 2400 },
  { month: 'Feb', sales: 3000, leads: 1398 },
  { month: 'Mar', sales: 2000, leads: 9800 },
  { month: 'Apr', sales: 2780, leads: 3908 },
  { month: 'May', sales: 1890, leads: 4800 },
  { month: 'Jun', sales: 2390, leads: 3800 },
  { month: 'Jul', sales: 3490, leads: 4300 },
  { month: 'Aug', sales: 4000, leads: 2400 },
  { month: 'Sep', sales: 3000, leads: 1398 },
  { month: 'Oct', sales: 2000, leads: 9800 },
  { month: 'Nov', sales: 2780, leads: 3908 },
  { month: 'Dec', sales: 1890, leads: 4800 },
];

const SalesChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={getComputedStyle(document.documentElement).getPropertyValue('--border-color')} />
        <XAxis 
          dataKey="month" 
          stroke={getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')}
          fontSize={12}
        />
        <YAxis 
          stroke={getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')}
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface-color'),
            border: `1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--border-color')}`,
            borderRadius: getComputedStyle(document.documentElement).getPropertyValue('--border-radius'),
          }}
        />
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke={getComputedStyle(document.documentElement).getPropertyValue('--primary-color')} 
          strokeWidth={2}
          dot={{ fill: getComputedStyle(document.documentElement).getPropertyValue('--primary-color') }}
        />
        <Line 
          type="monotone" 
          dataKey="leads" 
          stroke={getComputedStyle(document.documentElement).getPropertyValue('--success-color')} 
          strokeWidth={2}
          dot={{ fill: getComputedStyle(document.documentElement).getPropertyValue('--success-color') }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;





