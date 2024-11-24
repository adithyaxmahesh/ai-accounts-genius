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
  const formattedData = data.map(item => ({
    name: item.category,
    value: item.amount
  }));

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Revenue by Category</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={{ stroke: '#666', strokeWidth: 1 }}
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
              contentStyle={{ 
                backgroundColor: '#1A1F2C',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};