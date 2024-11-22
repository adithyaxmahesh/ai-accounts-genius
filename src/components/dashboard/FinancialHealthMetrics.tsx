import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, DollarSign, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const FinancialHealthMetrics = () => {
  const { session } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['financial-health', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_health_metrics')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Financial Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Overall Health Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(metrics?.health_score || 0)}`}>
                {metrics?.health_score || 0}%
              </p>
              <Progress value={metrics?.health_score || 0} className="mt-2" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Cash Flow Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(metrics?.cash_flow_score || 0)}`}>
                {metrics?.cash_flow_score || 0}%
              </p>
              <Progress value={metrics?.cash_flow_score || 0} className="mt-2" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Debt Ratio</p>
              <p className={`text-2xl font-bold ${getScoreColor(100 - (metrics?.debt_ratio || 0) * 100)}`}>
                {metrics?.debt_ratio || 0}
              </p>
              <Progress value={100 - (metrics?.debt_ratio || 0) * 100} className="mt-2" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Current Ratio</p>
              <p className={`text-2xl font-bold ${getScoreColor(metrics?.current_ratio ? metrics.current_ratio * 50 : 0)}`}>
                {metrics?.current_ratio || 0}
              </p>
              <Progress value={metrics?.current_ratio ? metrics.current_ratio * 50 : 0} className="mt-2" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};