import { Card } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    month: string;
    amount: number;
  }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <Card className="p-6 bg-card">
      <h3 className="text-xl font-semibold mb-4">Revenue Over Time</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#333" 
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="#888" 
              tick={{ fill: '#888' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke="#888"
              tick={{ fill: '#888' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              contentStyle={{ 
                backgroundColor: '#1A1F2C',
                border: '1px solid #333',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#888' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#9b87f5"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};