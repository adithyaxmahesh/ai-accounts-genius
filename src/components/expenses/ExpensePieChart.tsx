import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';

interface ExpensePieChartProps {
  expenses: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  activeIndex?: number;
  onMouseEnter: (data: any, index: number) => void;
  onMouseLeave: () => void;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const ExpensePieChart = ({ 
  expenses, 
  activeIndex, 
  onMouseEnter, 
  onMouseLeave 
}: ExpensePieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={expenses}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {expenses.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => `$${Math.abs(value).toLocaleString()}`} 
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};