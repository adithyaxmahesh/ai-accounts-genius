import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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
      return data;
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Fraud Detection</h2>
      </div>

      {!alerts?.length ? (
        <div className="text-center text-muted-foreground p-2">
          No suspicious activities
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1" />
              <div className="text-sm">
                <div className="font-medium">Risk: {(alert.risk_score * 100).toFixed(0)}%</div>
                <p className="text-muted-foreground line-clamp-2">
                  {alert.details?.analysis}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};