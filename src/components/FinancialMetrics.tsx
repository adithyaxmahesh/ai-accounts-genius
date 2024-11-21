import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { PiggyBank, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const FinancialMetrics = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['financial-metrics', session?.user.id],
    queryFn: async () => {
      // Fetch write-offs for tax savings calculation
      const { data: writeOffs } = await supabase
        .from('write_offs')
        .select('amount')
        .eq('user_id', session?.user.id)
        .eq('status', 'approved');

      // Fetch revenue records for cash flow
      const { data: revenueRecords } = await supabase
        .from('revenue_records')
        .select('amount, date')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false })
        .limit(30); // Last 30 records

      const totalWriteOffs = writeOffs?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      const estimatedTaxSavings = totalWriteOffs * 0.25; // Estimated 25% tax rate

      // Calculate cash flow health
      const recentRevenue = revenueRecords?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      const averageMonthlyRevenue = recentRevenue / (revenueRecords?.length || 1);
      const cashFlowHealth = averageMonthlyRevenue > 10000 ? 'Healthy' : 'Needs Attention';

      return {
        taxSavings: estimatedTaxSavings,
        totalWriteOffs,
        cashFlowHealth,
        averageMonthlyRevenue
      };
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/write-offs')}
      >
        <PiggyBank className="h-8 w-8 mb-2 text-green-500" />
        <h3 className="text-lg font-semibold mb-1">Tax Savings</h3>
        <p className="text-2xl font-bold truncate min-h-[2.5rem] flex items-center justify-start">
          <span className="text-green-500">
            ${metrics?.taxSavings.toLocaleString() || '0'}
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          From ${metrics?.totalWriteOffs.toLocaleString() || '0'} in write-offs
        </p>
      </Card>

      <Card 
        className="glass-card p-6 hover-scale cursor-pointer"
        onClick={() => navigate('/revenue')}
      >
        <TrendingUp className="h-8 w-8 mb-2 text-blue-500" />
        <h3 className="text-lg font-semibold mb-1">Cash Flow Health</h3>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold truncate min-h-[2.5rem] flex items-center justify-start">
            {metrics?.cashFlowHealth === 'Healthy' ? (
              <ArrowUpRight className="h-6 w-6 text-green-500" />
            ) : (
              <ArrowDownRight className="h-6 w-6 text-red-500" />
            )}
            <span className={metrics?.cashFlowHealth === 'Healthy' ? 'text-green-500' : 'text-red-500'}>
              {metrics?.cashFlowHealth}
            </span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Avg. Monthly Revenue: ${metrics?.averageMonthlyRevenue.toLocaleString() || '0'}
        </p>
      </Card>

      {/* Keep the third card slot available for future metrics */}
      <Card 
        className="glass-card p-6 hover-scale cursor-pointer opacity-50"
        onClick={() => navigate('/forecast')}
      >
        <TrendingUp className="h-8 w-8 mb-2 text-purple-500" />
        <h3 className="text-lg font-semibold mb-1">Coming Soon</h3>
        <p className="text-2xl font-bold truncate min-h-[2.5rem] flex items-center justify-start">
          <span className="text-purple-500">
            Financial Goals
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Track your business targets
        </p>
      </Card>
    </div>
  );
};
