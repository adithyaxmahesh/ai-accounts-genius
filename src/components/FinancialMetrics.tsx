import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const FinancialMetrics = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['financial-metrics', session?.user.id],
    queryFn: async () => {
      // Fetch revenue data for the last two months
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      
      const { data: revenueData } = await supabase
        .from('revenue_records')
        .select('amount, date')
        .eq('user_id', session?.user.id)
        .gte('date', twoMonthsAgo.toISOString())
        .order('date', { ascending: false });

      // Fetch active fraud alerts
      const { data: fraudAlerts } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('status', 'pending');

      // Calculate metrics
      const currentMonth = new Date().getMonth();
      const currentMonthRevenue = revenueData
        ?.filter(record => new Date(record.date).getMonth() === currentMonth)
        .reduce((sum, record) => sum + Number(record.amount), 0) || 0;

      const lastMonthRevenue = revenueData
        ?.filter(record => new Date(record.date).getMonth() === (currentMonth - 1))
        .reduce((sum, record) => sum + Number(record.amount), 0) || 0;

      const growthRate = lastMonthRevenue ? 
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      return {
        revenue: currentMonthRevenue,
        growthRate,
        alertCount: fraudAlerts?.length || 0
      };
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/revenue')}
      >
        <DollarSign className="h-8 w-8 mb-4 text-primary" />
        <h3 className="text-lg font-semibold">Revenue</h3>
        <p className="text-2xl font-bold truncate">
          ${metrics?.revenue.toLocaleString() || '0'}
        </p>
        <p className="text-sm text-muted-foreground">
          {metrics?.growthRate > 0 ? '+' : ''}{metrics?.growthRate.toFixed(1)}% from last month
        </p>
      </Card>
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/forecast')}
      >
        <TrendingUp className="h-8 w-8 mb-4 text-primary" />
        <h3 className="text-lg font-semibold">Growth</h3>
        <p className="text-3xl font-bold">
          {metrics?.growthRate > 0 ? '+' : ''}{metrics?.growthRate.toFixed(1)}%
        </p>
        <p className="text-sm text-muted-foreground">Year over year</p>
      </Card>
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/audit')}
      >
        <AlertTriangle className="h-8 w-8 mb-4 text-destructive" />
        <h3 className="text-lg font-semibold">Alerts</h3>
        <p className="text-3xl font-bold">{metrics?.alertCount || 0}</p>
        <p className="text-sm text-muted-foreground">Require attention</p>
      </Card>
    </div>
  );
};