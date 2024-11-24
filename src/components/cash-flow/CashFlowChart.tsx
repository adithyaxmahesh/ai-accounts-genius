import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

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
  const chartConfig = {
    operatingCF: {
      label: "Operating CF",
      theme: {
        light: "#3b82f6",
        dark: "#60a5fa",
      },
    },
    financingCF: {
      label: "Financing CF",
      theme: {
        light: "#8b5cf6",
        dark: "#a78bfa",
      },
    },
    freeCF: {
      label: "Free CF",
      theme: {
        light: "#22c55e",
        dark: "#4ade80",
      },
    },
    netCF: {
      label: "Net CF",
      theme: {
        light: "#eab308",
        dark: "#facc15",
      },
    },
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Cash Flow Trends</h3>
      <div className="h-[400px]">
        <ChartContainer config={chartConfig}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-sm text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-sm text-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="operatingCashFlow"
              name="operatingCF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="financingCashFlow"
              name="financingCF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="freeCashFlow"
              name="freeCF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="netCashFlow"
              name="netCF"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
};