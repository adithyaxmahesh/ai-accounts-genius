import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { HeartPulse, Target, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import type { FinancialGoal, RevenueRecord, MetricsData } from "@/integrations/supabase/types/financial";

export const FinancialMetrics = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: metrics } = useQuery<MetricsData>({
    queryKey: ['financial-metrics', session?.user.id],
    queryFn: async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const lastYear = currentYear - 1;
      
      // Fetch revenue data for cash flow calculation
      const { data: revenueData } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id)
        .gte('date', `${lastYear}-01-01`)
        .lte('date', `${currentYear}-12-31`)
        .order('date', { ascending: false });

      // Fetch financial goals
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('end_date', { ascending: true })
        .limit(1);

      const typedRevenueData = revenueData as RevenueRecord[] | null;
      const typedGoals = goals as FinancialGoal[] | null;

      if (!typedRevenueData) return { revenue: 0, cashFlowHealth: 0, goalProgress: 0, goalName: "No active goal" };

      // Calculate current month's revenue for cash flow health
      const currentMonth = now.getMonth();
      const currentMonthStart = new Date(currentYear, currentMonth, 1);
      const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);

      const currentMonthRevenue = typedRevenueData
        .filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= currentMonthStart && recordDate <= currentMonthEnd;
        })
        .reduce((sum, record) => sum + Number(record.amount), 0);

      // Calculate last month's revenue for trend
      const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
      const lastMonthEnd = new Date(currentYear, currentMonth, 0);

      const lastMonthRevenue = typedRevenueData
        .filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= lastMonthStart && recordDate <= lastMonthEnd;
        })
        .reduce((sum, record) => sum + Number(record.amount), 0);

      // Calculate cash flow health score (0-100)
      const cashFlowHealth = lastMonthRevenue ? 
        Math.min(100, Math.max(0, (currentMonthRevenue / lastMonthRevenue) * 100)) : 
        50;

      // Calculate goal progress if there's an active goal
      const activeGoal = typedGoals?.[0];
      const goalProgress = activeGoal ? 
        Math.min(100, ((activeGoal.current_amount || 0) / activeGoal.target_amount) * 100) : 
        0;

      return {
        revenue: currentMonthRevenue,
        cashFlowHealth,
        goalProgress,
        goalName: activeGoal?.name || "No active goal"
      };
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/revenue')}
      >
        <DollarSign className="h-8 w-8 mb-2 text-green-500" />
        <h3 className="text-lg font-semibold mb-1">Total Revenue</h3>
        <p className="text-2xl font-bold truncate min-h-[2.5rem] flex items-center justify-start">
          <span className="text-green-500">
            ${metrics?.revenue.toLocaleString() || '0'}
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Current month
        </p>
      </Card>
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/cash-flow')}
      >
        <HeartPulse className="h-8 w-8 mb-2 text-blue-500" />
        <h3 className="text-lg font-semibold mb-1">Cash Flow Health</h3>
        <p className="text-2xl font-bold truncate min-h-[2.5rem] flex items-center justify-start">
          <span className={metrics?.cashFlowHealth >= 70 ? "text-green-500" : 
                         metrics?.cashFlowHealth >= 40 ? "text-yellow-500" : 
                         "text-red-500"}>
            {metrics?.cashFlowHealth.toFixed(1) || '0'}%
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Month-over-month health score
        </p>
      </Card>
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/goals')}
      >
        <Target className="h-8 w-8 mb-2 text-purple-500" />
        <h3 className="text-lg font-semibold mb-1">Financial Goals</h3>
        <p className="text-2xl font-bold truncate min-h-[2.5rem] flex items-center justify-start">
          <span className="text-purple-500">
            {metrics?.goalProgress.toFixed(1) || '0'}%
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {metrics?.goalName}
        </p>
      </Card>
    </div>
  );
};