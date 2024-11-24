import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RevenueCategoriesProps {
  data: Array<{
    category: string;
    amount: number;
  }>;
}

const COLORS = ['#9b87f5', '#87c5f5', '#f587b8', '#87f5e9', '#f5d787'];

export const RevenueCategories = ({ data }: RevenueCategoriesProps) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Revenue by Category</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
              contentStyle={{ 
                backgroundColor: '#1A1F2C',
                border: '1px solid #333',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#888' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};