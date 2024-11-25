import { Card } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface BusinessMetric {
  id: string;
  user_id: string;
  category: string;
  metrics: Record<string, string | number>;
  recommendations: string[];
  priority: string;
  created_at: string;
}

export const BusinessMetrics = () => {
  const { session } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['business-metrics', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as BusinessMetric[];
    },
    enabled: !!session?.user.id
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Business Intelligence</h2>
      </div>

      <div className="space-y-4">
        {metrics?.map((metric) => (
          <div
            key={metric.id}
            className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{metric.category}</h3>
              <span className="text-sm text-muted-foreground">
                Priority: {metric.priority}
              </span>
            </div>
            {metric.metrics && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(metric.metrics).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-muted-foreground">{key}:</span>{" "}
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
            {metric.recommendations && metric.recommendations.length > 0 && (
              <div className="mt-2 text-sm text-primary">
                <strong>Recommendation:</strong>{" "}
                {metric.recommendations[0]}
              </div>
            )}
          </div>
        ))}

        {!metrics?.length && (
          <div className="text-center text-muted-foreground">
            No business metrics available. They will appear here as your business data is analyzed.
          </div>
        )}
      </div>
    </Card>
  );
};