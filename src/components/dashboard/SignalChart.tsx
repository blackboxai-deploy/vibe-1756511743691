"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignalChartProps {
  title: string;
  data: number[][];
  labels: string[];
  colors: string[];
  yAxisRange?: [number, number];
  unit?: string;
  height?: number;
}

export function SignalChart({ 
  title, 
  data, 
  labels, 
  colors, 
  yAxisRange,
  unit = '',
  height = 300 
}: SignalChartProps) {
  
  // تحويل البيانات إلى تنسيق مناسب للرسم
  const chartData = data[0]?.map((_, index) => {
    const point: any = { index };
    data.forEach((channel, channelIndex) => {
      point[labels[channelIndex]] = channel[index];
    });
    return point;
  }) || [];

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-200 flex items-center justify-between">
          <span>{title}</span>
          {unit && <span className="text-sm text-slate-400 font-normal">({unit})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="index" 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={yAxisRange || ['auto', 'auto']}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '12px',
                  color: '#9CA3AF'
                }}
              />
              {labels.map((label, index) => (
                <Line
                  key={label}
                  type="monotone"
                  dataKey={label}
                  stroke={colors[index] || '#8B5CF6'}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* إحصائيات سريعة */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {data.slice(0, 4).map((channel, index) => {
            const recentValues = channel.slice(-10).filter(v => v !== 0);
            const avg = recentValues.length > 0 
              ? recentValues.reduce((a, b) => a + b, 0) / recentValues.length 
              : 0;
            const max = recentValues.length > 0 ? Math.max(...recentValues) : 0;
            
            return (
              <div key={index} className="text-center p-2 bg-slate-700/30 rounded">
                <div className="text-xs text-slate-400">{labels[index]}</div>
                <div className="text-sm font-medium" style={{ color: colors[index] }}>
                  {avg.toFixed(1)}
                </div>
                <div className="text-xs text-slate-500">max: {max.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}