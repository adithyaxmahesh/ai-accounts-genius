import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DollarSign, Target, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const FinancialMetrics = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['financial-metrics', session?.user.id],
    queryFn: async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const lastYear = currentYear - 1;
      
      // Fetch all revenue data for current and previous year
      const { data: revenueData } = await supabase
        .from('revenue_records')
        .select('amount, date')
        .eq('user_id', session?.user.id)
        .gte('date', `${lastYear}-01-01`)
        .lte('date', `${currentYear}-12-31`)
        .order('date', { ascending: false });

      // Fetch active fraud alerts
      const { data: fraudAlerts } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('status', 'pending');

      if (!revenueData) return { revenue: 0, growthRate: 0, alertCount: 0 };

      // Calculate current month's revenue
      const currentMonth = now.getMonth();
      const currentMonthStart = new Date(currentYear, currentMonth, 1);
      const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);

      const currentMonthRevenue = revenueData
        .filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= currentMonthStart && recordDate <= currentMonthEnd;
        })
        .reduce((sum, record) => sum + Number(record.amount), 0);

      // Calculate last month's revenue
      const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
      const lastMonthEnd = new Date(currentYear, currentMonth, 0);

      const lastMonthRevenue = revenueData
        .filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= lastMonthStart && recordDate <= lastMonthEnd;
        })
        .reduce((sum, record) => sum + Number(record.amount), 0);

      // Calculate year-over-year growth
      const sameMonthLastYearStart = new Date(lastYear, currentMonth, 1);
      const sameMonthLastYearEnd = new Date(lastYear, currentMonth + 1, 0);

      const lastYearRevenue = revenueData
        .filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= sameMonthLastYearStart && recordDate <= sameMonthLastYearEnd;
        })
        .reduce((sum, record) => sum + Number(record.amount), 0);

      // Calculate growth rates
      const monthOverMonthGrowth = lastMonthRevenue ? 
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      const yearOverYearGrowth = lastYearRevenue ? 
        ((currentMonthRevenue - lastYearRevenue) / lastYearRevenue) * 100 : 0;

      return {
        revenue: currentMonthRevenue,
        monthOverMonthGrowth,
        yearOverYearGrowth,
        alertCount: fraudAlerts?.length || 0
      };
    }
  });

  // Calculate progress towards revenue goal (example: $100,000 monthly goal)
  const monthlyGoal = 100000;
  const progressPercentage = ((metrics?.revenue || 0) / monthlyGoal) * 100;

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
          {metrics?.monthOverMonthGrowth > 0 ? '+' : ''}{metrics?.monthOverMonthGrowth.toFixed(1)}% from last month
        </p>
      </Card>
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/forecast')}
      >
        <Target className="h-8 w-8 mb-2 text-purple-500" />
        <h3 className="text-lg font-semibold mb-1">Financial Goals</h3>
        <p className="text-2xl font-bold truncate min-h-[2.5rem] flex items-center justify-start">
          <span className="text-purple-500">
            {progressPercentage.toFixed(1)}%
          </span>
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          ${metrics?.revenue.toLocaleString()} of ${monthlyGoal.toLocaleString()} goal
        </p>
      </Card>
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/forecast')}
      >
        <AlertTriangle className="h-8 w-8 mb-2 text-blue-500" />
        <h3 className="text-lg font-semibold mb-1">Net Profit</h3>
        <p className="text-2xl font-bold truncate min-h-[2.5rem] flex items-center justify-start">
          <span className="text-blue-500">
            ${((metrics?.revenue || 0) * 0.8).toLocaleString()}
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          80% profit margin
        </p>
      </Card>
    </div>
  );
};