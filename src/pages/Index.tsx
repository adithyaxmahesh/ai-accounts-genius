import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics', session?.user.id],
    queryFn: async () => {
      const [revenueResult, expensesResult] = await Promise.all([
        supabase
          .from('revenue_records')
          .select('amount')
          .eq('user_id', session?.user.id),
        supabase
          .from('write_offs')
          .select('amount')
          .eq('user_id', session?.user.id)
      ]);

      const totalRevenue = revenueResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
      const totalExpenses = expensesResult.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      return {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        availableBalance: totalRevenue - totalExpenses
      };
    },
    enabled: !!session?.user.id,
  });

  const { data: chartData } = useQuery({
    queryKey: ['dashboard-chart-data', session?.user.id],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        { name: 'Jan', revenue: 4000, expenses: 2400 },
        { name: 'Feb', revenue: 3000, expenses: 1398 },
        { name: 'Mar', revenue: 2000, expenses: 9800 },
        { name: 'Apr', revenue: 2780, expenses: 3908 },
        { name: 'May', revenue: 1890, expenses: 4800 },
        { name: 'Jun', revenue: 2390, expenses: 3800 },
      ];
    },
  });

  if (!session) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Tax Pro</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Please sign in to access your dashboard
        </p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 animate-fade-in">
      <DashboardHeader />
      <DashboardMetrics metrics={metrics} />
      <DashboardCharts data={chartData} />
    </div>
  );
};

export default Index;