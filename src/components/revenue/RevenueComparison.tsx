import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface RevenueComparisonProps {
  data: any[];
}

export const RevenueComparison = ({ data }: RevenueComparisonProps) => {
  const [comparisonType, setComparisonType] = useState("month");

  const periods = {
    month: ["Current Month", "Previous Month"],
    quarter: ["Current Quarter", "Previous Quarter"],
    year: ["Current Year", "Previous Year"]
  };

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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis 
              stroke="#888"
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1F2C',
                border: '1px solid #333',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey="current" fill="#9b87f5" name="Current Period" />
            <Bar dataKey="previous" fill="#87c5f5" name="Previous Period" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};