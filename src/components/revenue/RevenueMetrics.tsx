import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface RevenueMetricsProps {
  totalRevenue: number;
  averageRevenue: number;
}

export const RevenueMetrics = ({ totalRevenue, averageRevenue }: RevenueMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 bg-card">
        <h3 className="text-xl font-semibold mb-4">Total Revenue</h3>
        <p className="text-3xl font-bold text-primary">${totalRevenue.toLocaleString()}</p>
      </Card>

      <Card className="p-6 bg-card">
        <h3 className="text-xl font-semibold mb-4">Average Revenue</h3>
        <p className="text-3xl font-bold text-primary">${averageRevenue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</p>
      </Card>

      <Card className="p-6 bg-card">
        <h3 className="text-xl font-semibold mb-4">Growth Rate</h3>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-500" />
          <p className="text-3xl font-bold text-green-500">+12.5%</p>
        </div>
      </Card>
    </div>
  );
};