import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, DollarSign, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const FinancialHealthCard = () => {
  const { session } = useAuth();

  const { data: healthMetrics } = useQuery({
    queryKey: ['financial-health', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_health_metrics')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

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
            {healthMetrics?.health_score?.toFixed(1) || 'N/A'}
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <h3 className="font-medium">Cash Flow</h3>
          </div>
          <p className="text-2xl font-bold text-green-500">
            {healthMetrics?.cash_flow_score?.toFixed(1) || 'N/A'}
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-yellow-500" />
            <h3 className="font-medium">Debt Ratio</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-500">
            {healthMetrics?.debt_ratio?.toFixed(2) || 'N/A'}
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-purple-500" />
            <h3 className="font-medium">Current Ratio</h3>
          </div>
          <p className="text-2xl font-bold text-purple-500">
            {healthMetrics?.current_ratio?.toFixed(2) || 'N/A'}
          </p>
        </div>
      </div>
    </Card>
  );
};