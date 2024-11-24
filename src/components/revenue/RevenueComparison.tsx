import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface RevenueComparisonProps {
  data: any[];
}

export const RevenueComparison = ({ data }: RevenueComparisonProps) => {
  const [comparisonType, setComparisonType] = useState("month");
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    // Transform the data based on comparison type
    const currentDate = new Date();
    const transformedData = data.reduce((acc, item) => {
      const itemDate = new Date(item.date);
      const isPrevious = comparisonType === "month" 
        ? itemDate.getMonth() === currentDate.getMonth() - 1
        : comparisonType === "quarter"
        ? Math.floor(itemDate.getMonth() / 3) === Math.floor(currentDate.getMonth() / 3) - 1
        : itemDate.getFullYear() === currentDate.getFullYear() - 1;

      const period = isPrevious ? "Previous" : "Current";
      
      const existingPeriod = acc.find(p => p.name === period);
      if (existingPeriod) {
        existingPeriod.amount += Number(item.amount);
      } else {
        acc.push({ name: period, amount: Number(item.amount) });
      }
      
      return acc;
    }, []);

    setComparisonData(transformedData);
  }, [data, comparisonType]);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Revenue Comparison</h3>
        <Select
          value={comparisonType}
          onValueChange={setComparisonType}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="quarter">Quarterly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="name" 
              stroke="#888"
              tick={{ fill: '#888' }}
            />
            <YAxis 
              stroke="#888"
              tick={{ fill: '#888' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1F2C',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '8px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Legend />
            <Bar 
              dataKey="amount" 
              fill="#9b87f5"
              radius={[4, 4, 0, 0]}
              className="transition-all duration-300 hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};