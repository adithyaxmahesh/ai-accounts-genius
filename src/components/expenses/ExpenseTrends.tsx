import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";

interface ExpenseTrendsProps {
  expenses: Array<{
    name: string;
    value: number;
  }>;
}

export const ExpenseTrends = ({ expenses }: ExpenseTrendsProps) => {
  // Transform data for trend visualization
  const trendData = expenses.map((expense, index) => ({
    name: expense.name,
    amount: expense.value,
    average: expenses.reduce((sum, e) => sum + e.value, 0) / expenses.length
  }));

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Expense Trends</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{ 
                backgroundColor: '#1A1F2C',
                border: '1px solid #333',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#9b87f5" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="average" 
              stroke="#f587b8" 
              strokeWidth={2} 
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};