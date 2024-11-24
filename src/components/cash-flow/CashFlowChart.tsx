import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CashFlowChartProps {
  data: Array<{
    date: string;
    operatingCashFlow: number;
    financingCashFlow: number;
    freeCashFlow: number;
    netCashFlow: number;
  }>;
}

export const CashFlowChart = ({ data }: CashFlowChartProps) => {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Cash Flow Trends</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="operatingCashFlow" stroke="#3b82f6" name="Operating CF" />
            <Line type="monotone" dataKey="financingCashFlow" stroke="#8b5cf6" name="Financing CF" />
            <Line type="monotone" dataKey="freeCashFlow" stroke="#22c55e" name="Free CF" />
            <Line type="monotone" dataKey="netCashFlow" stroke="#eab308" name="Net CF" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};