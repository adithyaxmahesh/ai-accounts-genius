import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Shield, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  alert_type: string;
  status?: string;
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
        .limit(5);
      
      if (error) throw error;
      
      return (data || []).map(alert => ({
        id: alert.id,
        risk_score: alert.risk_score || 0,
        alert_type: alert.alert_type,
        status: alert.status,
        details: alert.details as FraudAlertDetails,
        created_at: alert.created_at
      })) as FraudAlert[];
    }
  });

  const metrics = [
    { name: "Unusual Transaction Patterns", description: "Sudden changes in transaction frequency or amounts" },
    { name: "Geographic Anomalies", description: "Transactions from unusual locations" },
    { name: "Time-based Analysis", description: "Transactions outside normal business hours" },
    { name: "Category Deviations", description: "Unusual spending patterns in specific categories" },
    { name: "Velocity Checks", description: "Multiple transactions in short time periods" }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Fraud Detection</h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-5 w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>View fraud detection metrics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Detection Metrics:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          {metrics.map((metric) => (
            <li key={metric.name} className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>{metric.name}</span>
            </li>
          ))}
        </ul>
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
                  {alert.details?.analysis || 'No analysis available'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};