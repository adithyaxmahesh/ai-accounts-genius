import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

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
    <Card className="p-4 bg-background">
      <h3 className="font-semibold mb-4 text-foreground">Cash Flow Trends</h3>
      <div className="h-[400px]">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
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
              <ChartTooltip 
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="operatingCashFlow"
                name="Operating CF"
                stroke={chartConfig.operatingCF.theme.dark}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="financingCashFlow"
                name="Financing CF"
                stroke={chartConfig.financingCF.theme.dark}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="freeCashFlow"
                name="Free CF"
                stroke={chartConfig.freeCF.theme.dark}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="netCashFlow"
                name="Net CF"
                stroke={chartConfig.netCF.theme.dark}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};