import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BreakEvenChartProps {
  analysis: {
    fixed_costs: number;
    variable_cost_per_unit: number;
    selling_price_per_unit: number;
    break_even_point: number;
  };
}

export const BreakEvenChart = ({ analysis }: BreakEvenChartProps) => {
  const generateChartData = () => {
    const bep = Math.round(analysis.break_even_point);
    const dataPoints = [];
    const numPoints = 10;
    
    for (let i = 0; i <= numPoints; i++) {
      const units = Math.round((bep * 2 * i) / numPoints);
      const totalRevenue = units * analysis.selling_price_per_unit;
      const totalCosts = analysis.fixed_costs + (units * analysis.variable_cost_per_unit);
      
      dataPoints.push({
        units,
        revenue: totalRevenue,
        costs: totalCosts,
      });
    }
    
    return dataPoints;
  };

  const data = generateChartData();

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="units" 
            label={{ value: 'Units', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ 
              value: 'Amount ($)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip 
            formatter={(value: number) => ['$' + value.toLocaleString()]}
            labelFormatter={(label: number) => `Units: ${label.toLocaleString()}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            name="Total Revenue"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="costs" 
            stroke="#ef4444" 
            name="Total Costs"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};