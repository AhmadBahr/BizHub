import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { stage: 'Lead', conversion: 65, target: 70 },
  { stage: 'Qualified', conversion: 45, target: 50 },
  { stage: 'Proposal', conversion: 30, target: 35 },
  { stage: 'Negotiation', conversion: 20, target: 25 },
  { stage: 'Closed', conversion: 15, target: 20 },
];

const ConversionChart: React.FC = () => {
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





