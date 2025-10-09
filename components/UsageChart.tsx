import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useI18n } from '../hooks/useI18n';
import { useTheme } from '../hooks/useTheme';

interface UsageChartProps {
  data: { date: string; count: number }[];
}

const UsageChart: React.FC<UsageChartProps> = ({ data }) => {
  const { language, t } = useI18n();
  const { effectiveTheme } = useTheme();

  const colors = {
    light: { text: '#64748b', grid: '#f1f5f9', tooltipBg: '#ffffff', tooltipText: '#0f172a', line: '#2563eb' },
    dark: { text: '#94a3b8', grid: '#1e293b', tooltipBg: '#0f172a', tooltipText: '#f1f5f9', line: '#3b82f6' },
  };
  const currentColors = colors[effectiveTheme];

  const formattedData = data.map(item => ({
      ...item,
      // Format date for display based on locale
      name: new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }),
  }));

  return (
    <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-xl shadow-card-shadow dark:shadow-card-shadow-dark h-96">
        <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">{t('dashboard.usageChart.title')}</h3>
        <ResponsiveContainer width="100%" height="90%">
            <LineChart
                data={formattedData}
                margin={{
                    top: 5,
                    right: language === 'ar' ? 0 : 20,
                    left: language === 'ar' ? 20 : -10,
                    bottom: 20,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={currentColors.grid} />
                <XAxis dataKey="name" stroke={currentColors.text} reversed={language === 'ar'} />
                <YAxis allowDecimals={false} stroke={currentColors.text} orientation={language === 'ar' ? 'right' : 'left'} />
                
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: currentColors.tooltipBg, 
                        borderColor: currentColors.grid,
                        color: currentColors.tooltipText,
                        borderRadius: '0.75rem',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => [value, t('dashboard.usageChart.checks')]}
                />
                <Legend wrapperStyle={{color: currentColors.text}} formatter={() => t('dashboard.usageChart.legend')}/>
                <Line type="monotone" dataKey="count" stroke={currentColors.line} strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;