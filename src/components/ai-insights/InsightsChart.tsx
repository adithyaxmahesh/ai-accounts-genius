import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface InsightsChartProps {
  chartData: Array<{
    date: string;
    confidence: number;
  }>;
}

export const InsightsChart = ({ chartData }: InsightsChartProps) => {
  return (
    <div className="h-64 mb-6 bg-muted/50 rounded-lg p-4 hover:bg-muted/60 transition-colors">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            stroke="currentColor" 
            className="text-xs" 
          />
          <YAxis 
            stroke="currentColor" 
            className="text-xs"
          />
          <Tooltip 
            contentStyle={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />
          <Area
            type="monotone"
            dataKey="confidence"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorConfidence)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};