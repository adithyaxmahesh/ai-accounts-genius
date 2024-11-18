import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface FraudAlertDetails {
  analysis: string;
  transactions?: any[];
}

interface FraudAlert {
  id: string;
  risk_score: number;
  details: FraudAlertDetails;
  created_at: string;
}

export const FraudDetection = () => {
  const { session } = useAuth();

  const { data: alerts } = useQuery({
    queryKey: ['fraud-alerts', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      
      return (data || []).map(alert => ({
        id: alert.id,
        risk_score: alert.risk_score || 0,
        details: {
          analysis: (alert.details as { analysis: string })?.analysis || 'Suspicious activity detected',
          transactions: (alert.details as { transactions?: any[] })?.transactions
        },
        created_at: alert.created_at
      })) as FraudAlert[];
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Fraud Detection</h2>
      </div>

      {!alerts?.length ? (
        <div className="text-center text-muted-foreground p-4">
          No suspicious activities detected
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <div className="font-medium">Risk Score: {(alert.risk_score * 100).toFixed(0)}%</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {alert.details.analysis}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};