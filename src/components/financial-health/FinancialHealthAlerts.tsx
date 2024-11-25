import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export const FinancialHealthAlerts = () => {
  const { session } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['financial-health-metrics', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_health_metrics')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  if (!metrics) return null;

  const alerts = [];

  // Check current ratio (healthy is typically > 1)
  if (metrics.current_ratio < 1) {
    alerts.push({
      type: 'warning',
      title: 'Low Current Ratio',
      description: 'Your current ratio is below 1, indicating potential liquidity issues.'
    });
  }

  // Check debt ratio (healthy is typically < 0.5)
  if (metrics.debt_ratio > 0.5) {
    alerts.push({
      type: 'warning',
      title: 'High Debt Ratio',
      description: 'Your debt ratio is above 50%, consider reducing debt levels.'
    });
  }

  // Check cash flow score (healthy is typically > 0.2)
  if (metrics.cash_flow_score < 0.2) {
    alerts.push({
      type: 'error',
      title: 'Cash Flow Concerns',
      description: 'Your cash flow score indicates potential cash flow issues.'
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      title: 'Healthy Financial Metrics',
      description: 'All your financial health indicators are within healthy ranges.'
    });
  }

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Financial Health Alerts</h2>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <Alert key={index} variant={alert.type === 'success' ? 'default' : 'destructive'}>
            {alert.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : alert.type === 'warning' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
      </div>
    </Card>
  );
};