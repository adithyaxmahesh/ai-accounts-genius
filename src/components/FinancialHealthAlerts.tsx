import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, TrendingUp, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

export const FinancialHealthAlerts = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: alerts } = useQuery({
    queryKey: ['financial-health-alerts', session?.user.id],
    queryFn: async () => {
      const { data: metrics } = await supabase
        .from('financial_health_metrics')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();

      const alerts = [];
      
      if (metrics) {
        if (metrics.cash_flow_score < 0.7) {
          alerts.push({
            type: 'warning',
            message: 'Cash flow score is below recommended levels',
            metric: 'Cash Flow Score',
            value: `${(metrics.cash_flow_score * 100).toFixed(1)}%`,
            icon: TrendingDown,
            color: 'text-yellow-500'
          });
        }

        if (metrics.debt_ratio > 0.5) {
          alerts.push({
            type: 'danger',
            message: 'Debt ratio is above recommended threshold',
            metric: 'Debt Ratio',
            value: `${(metrics.debt_ratio * 100).toFixed(1)}%`,
            icon: AlertTriangle,
            color: 'text-red-500'
          });
        }

        if (metrics.current_ratio < 1.5) {
          alerts.push({
            type: 'warning',
            message: 'Current ratio indicates potential liquidity issues',
            metric: 'Current Ratio',
            value: metrics.current_ratio.toFixed(2),
            icon: DollarSign,
            color: 'text-yellow-500'
          });
        }
      }

      return alerts;
    },
    enabled: !!session?.user.id
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Financial Health Alerts</h2>
      </div>

      <div className="space-y-4">
        {alerts?.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <div
              key={index}
              className="p-4 bg-muted rounded-lg flex items-start gap-3"
            >
              <Icon className={`h-5 w-5 mt-0.5 ${alert.color}`} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{alert.metric}</p>
                  <span className={`text-sm ${alert.color}`}>
                    {alert.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {alert.message}
                </p>
              </div>
            </div>
          );
        })}

        {(!alerts || alerts.length === 0) && (
          <div className="text-center text-muted-foreground py-4">
            No financial health alerts at this time
          </div>
        )}
      </div>
    </Card>
  );
};