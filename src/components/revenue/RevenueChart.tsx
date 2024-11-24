import { Card } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    month: string;
    amount: number;
  }>;
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
  // Ensure we have at least 2 data points for a proper chart
  const chartData = data.length < 2 ? [
    { month: 'Previous', amount: 0 },
    ...data,
    { month: 'Next', amount: 0 }
  ] : data;

  return (
    <Card className="p-6 bg-card">
      <h3 className="text-xl font-semibold mb-4">Revenue Over Time</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#333" 
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="#888" 
              tick={{ fill: '#888' }}
              tickLine={false}
              axisLine={false}
              padding={{ left: 30, right: 30 }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke="#888"
              tick={{ fill: '#888' }}
              tickLine={false}
              axisLine={false}
              width={80}
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
              cursor={{ stroke: '#9b87f5', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#9b87f5"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              animationDuration={1000}
              dot={{ stroke: '#9b87f5', strokeWidth: 2, r: 4, fill: '#1A1F2C' }}
              activeDot={{ stroke: '#9b87f5', strokeWidth: 2, r: 6, fill: '#1A1F2C' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};