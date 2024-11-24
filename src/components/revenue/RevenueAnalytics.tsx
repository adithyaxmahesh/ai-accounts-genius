import { Card } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp, DollarSign, Users } from "lucide-react";

interface RevenueAnalyticsProps {
  totalRevenue: number;
  averageRevenue: number;
}

export const RevenueAnalytics = ({ totalRevenue, averageRevenue }: RevenueAnalyticsProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Revenue Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-4 bg-card/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Growth Rate</p>
              <h4 className="text-2xl font-bold text-green-500">+12.5%</h4>
            </div>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Compared to last month</p>
        </Card>

        <Card className="p-4 bg-card/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Average Transaction</p>
              <h4 className="text-2xl font-bold">${averageRevenue.toFixed(2)}</h4>
            </div>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Per revenue entry</p>
        </Card>

        <Card className="p-4 bg-card/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Revenue Forecast</p>
              <h4 className="text-2xl font-bold">${(totalRevenue * 1.15).toFixed(2)}</h4>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Next month projection</p>
        </Card>
      </div>
    </Card>
  );
};