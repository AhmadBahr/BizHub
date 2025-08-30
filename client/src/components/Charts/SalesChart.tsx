import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: Array<{
    month: string;
    sales: number;
    leads: number;
  }>;
}

const SalesChart: React.FC<SalesChartProps> = ({ data = [] }) => {
  // Default empty state
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontSize: '14px'
      }}>
        No sales data available
      </div>
    );
  }

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





