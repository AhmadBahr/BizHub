import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ConversionChartProps {
  data: Array<{
    stage: string;
    conversion: number;
    target: number;
  }>;
}

const ConversionChart: React.FC<ConversionChartProps> = ({ data = [] }) => {
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
        No conversion data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={getComputedStyle(document.documentElement).getPropertyValue('--border-color')} />
        <XAxis 
          dataKey="stage" 
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
        <Bar 
          dataKey="conversion" 
          fill={getComputedStyle(document.documentElement).getPropertyValue('--primary-color')} 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="target" 
          fill={getComputedStyle(document.documentElement).getPropertyValue('--warning-color')} 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ConversionChart;





