import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, DollarSign, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import type { FinancialHealthMetrics } from "@/integrations/supabase/types/financial";

export const FinancialHealthCard = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: healthMetrics } = useQuery({
    queryKey: ['financial-health', session?.user.id],
    queryFn: async () => {
      try {
        // First try to get existing metrics
        const { data: existingMetrics, error } = await supabase
          .from('financial_health_metrics')
          .select('*')
          .eq('user_id', session?.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (existingMetrics) {
          return existingMetrics;
        }

        // If no metrics exist, calculate and store them
        const { data: revenueData } = await supabase
          .from('revenue_records')
          .select('amount')
          .eq('user_id', session?.user.id);

        const { data: writeOffs } = await supabase
          .from('write_offs')
          .select('amount')
          .eq('user_id', session?.user.id);

        const totalRevenue = revenueData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
        const totalExpenses = writeOffs?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;

        // Calculate financial health metrics
        const healthScore = Math.min(100, (totalRevenue / (totalExpenses || 1)) * 50);
        const cashFlowScore = totalRevenue - totalExpenses;
        const debtRatio = totalExpenses / (totalRevenue || 1);
        const currentRatio = totalRevenue / (totalExpenses || 1);

        // Store the calculated metrics
        const { data: newMetrics, error: insertError } = await supabase
          .from('financial_health_metrics')
          .insert({
            user_id: session?.user.id,
            health_score: healthScore,
            cash_flow_score: cashFlowScore,
            debt_ratio: debtRatio,
            current_ratio: currentRatio,
            metrics_data: {
              total_revenue: totalRevenue,
              total_expenses: totalExpenses
            }
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newMetrics;
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error calculating financial health",
          description: error.message
        });
        return null;
      }
    },
    enabled: !!session?.user.id
  });

  const formatMetric = (value: number | null | undefined, prefix: string = '', decimals: number = 1) => {
    if (value == null) return 'N/A';
    if (prefix === '$') {
      return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    }
    return `${value.toFixed(decimals)}${prefix}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Financial Health</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium">Health Score</h3>
          </div>
          <p className="text-2xl font-bold text-blue-500">
            {formatMetric(healthMetrics?.health_score, '%')}
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <h3 className="font-medium">Cash Flow</h3>
          </div>
          <p className="text-2xl font-bold text-green-500">
            {formatMetric(healthMetrics?.cash_flow_score, '$')}
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-yellow-500" />
            <h3 className="font-medium">Debt Ratio</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-500">
            {formatMetric(healthMetrics?.debt_ratio)}
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-purple-500" />
            <h3 className="font-medium">Current Ratio</h3>
          </div>
          <p className="text-2xl font-bold text-purple-500">
            {formatMetric(healthMetrics?.current_ratio)}
          </p>
        </div>
      </div>
    </Card>
  );
};