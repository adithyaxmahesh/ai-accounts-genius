import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, PieChart, LineChart } from "lucide-react";

interface InsightCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  trendColor: string;
}

const InsightCard = ({ title, value, trend, icon, trendColor }: InsightCardProps) => (
  <Card className="p-4 bg-card/50 hover:bg-card/70 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
    </div>
    <p className="text-2xl font-bold mb-1">{value}</p>
    <p className={`text-sm ${trendColor}`}>{trend}</p>
  </Card>
);

export const FinancialInsights = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Financial Insights</h2>
        <span className="text-sm text-muted-foreground">Last 30 days</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          title="Growth Rate"
          value="8.5%"
          trend="↗ Increasing trend"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          trendColor="text-green-500"
        />
        
        <InsightCard
          title="Revenue Performance"
          value="Positive"
          trend="12.5% above target"
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          trendColor="text-green-500"
        />
        
        <InsightCard
          title="Expense Efficiency"
          value="Moderate"
          trend="Within budget limits"
          icon={<PieChart className="h-5 w-5 text-primary" />}
          trendColor="text-blue-500"
        />
        
        <InsightCard
          title="Performance Score"
          value="85/100"
          trend="Top quartile performance"
          icon={<LineChart className="h-5 w-5 text-primary" />}
          trendColor="text-purple-500"
        />
      </div>
    </div>
  );
};