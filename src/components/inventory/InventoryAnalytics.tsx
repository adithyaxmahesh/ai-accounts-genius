import { Card } from "@/components/ui/card";
import { Package2, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const InventoryAnalytics = () => {
  const { session } = useAuth();

  const { data: analytics } = useQuery({
    queryKey: ['inventory-analytics', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_analytics')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package2 className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Inventory Analytics</h2>
      </div>
      
      {analytics?.demand_forecast && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Demand Forecast</h3>
            <div className="text-sm text-muted-foreground">
              {JSON.stringify(analytics.demand_forecast, null, 2)}
            </div>
          </div>
          
          {analytics.optimization_suggestions && (
            <div>
              <h3 className="text-sm font-medium mb-2">Optimization Suggestions</h3>
              <ul className="space-y-2">
                {Object.entries(analytics.optimization_suggestions).map(([key, value]) => (
                  <li key={key} className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm">{String(value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {!analytics && (
        <div className="text-center text-muted-foreground">
          No inventory analytics available
        </div>
      )}
    </Card>
  );
};