import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, PieChart, LineChart } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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
  const { session } = useAuth();
  const { data: metrics } = useFinancialData();
  
  // Fetch historical data for comparison
  const { data: historicalMetrics } = useQuery({
    queryKey: ['historical-metrics', session?.user.id],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('revenue_records')
        .select('amount, date')
        .eq('user_id', session?.user.id)
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id
  });

  // Calculate growth rate
  const calculateGrowthRate = () => {
    if (!historicalMetrics || historicalMetrics.length < 2) return 0;
    
    const oldestRevenue = historicalMetrics[0].amount;
    const latestRevenue = historicalMetrics[historicalMetrics.length - 1].amount;
    
    return ((latestRevenue - oldestRevenue) / oldestRevenue) * 100;
  };

  // Calculate performance score
  const calculatePerformanceScore = () => {
    if (!metrics) return 0;
    
    const profitMarginWeight = 0.4;
    const revenueGoalWeight = 0.3;
    const expenseEfficiencyWeight = 0.3;
    
    const profitMarginScore = Math.min(100, (metrics.profitMargin / 20) * 100);
    const revenueGoalScore = Math.min(100, (metrics.totalRevenue / metrics.revenueGoal) * 100);
    const expenseEfficiencyScore = Math.min(100, ((metrics.totalRevenue - metrics.totalExpenses) / metrics.totalRevenue) * 100);
    
    return Math.round(
      (profitMarginScore * profitMarginWeight) +
      (revenueGoalScore * revenueGoalWeight) +
      (expenseEfficiencyScore * expenseEfficiencyWeight)
    );
  };

  // Calculate expense efficiency
  const calculateExpenseEfficiency = () => {
    if (!metrics) return { status: "Unknown", trend: "No data available" };
    
    const expenseRatio = metrics.totalExpenses / metrics.totalRevenue;
    
    if (expenseRatio <= 0.6) return { status: "Excellent", trend: "Well below budget limits" };
    if (expenseRatio <= 0.75) return { status: "Good", trend: "Within budget limits" };
    if (expenseRatio <= 0.85) return { status: "Moderate", trend: "Approaching budget limits" };
    return { status: "High", trend: "Exceeding budget limits" };
  };

  const growthRate = calculateGrowthRate();
  const performanceScore = calculatePerformanceScore();
  const expenseEfficiency = calculateExpenseEfficiency();
  const revenuePerformance = metrics?.totalRevenue 
    ? ((metrics.totalRevenue / (metrics.revenueGoal || metrics.totalRevenue)) * 100) - 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Financial Insights</h2>
        <span className="text-sm text-muted-foreground">Last 30 days</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          title="Growth Rate"
          value={`${growthRate.toFixed(1)}%`}
          trend={growthRate > 0 ? "↗ Increasing trend" : "↘ Decreasing trend"}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          trendColor={growthRate > 0 ? "text-green-500" : "text-red-500"}
        />
        
        <InsightCard
          title="Revenue Performance"
          value={revenuePerformance > 0 ? "Positive" : "Below Target"}
          trend={`${Math.abs(revenuePerformance).toFixed(1)}% ${revenuePerformance > 0 ? 'above' : 'below'} target`}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          trendColor={revenuePerformance > 0 ? "text-green-500" : "text-red-500"}
        />
        
        <InsightCard
          title="Expense Efficiency"
          value={expenseEfficiency.status}
          trend={expenseEfficiency.trend}
          icon={<PieChart className="h-5 w-5 text-primary" />}
          trendColor={
            expenseEfficiency.status === "Excellent" ? "text-green-500" :
            expenseEfficiency.status === "Good" ? "text-blue-500" :
            expenseEfficiency.status === "Moderate" ? "text-yellow-500" :
            "text-red-500"
          }
        />
        
        <InsightCard
          title="Performance Score"
          value={`${performanceScore}/100`}
          trend={
            performanceScore >= 80 ? "Top quartile performance" :
            performanceScore >= 60 ? "Above average performance" :
            performanceScore >= 40 ? "Average performance" :
            "Below average performance"
          }
          icon={<LineChart className="h-5 w-5 text-primary" />}
          trendColor={
            performanceScore >= 80 ? "text-purple-500" :
            performanceScore >= 60 ? "text-blue-500" :
            performanceScore >= 40 ? "text-yellow-500" :
            "text-red-500"
          }
        />
      </div>
    </div>
  );
};