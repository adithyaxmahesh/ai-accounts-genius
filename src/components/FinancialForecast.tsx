import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

export const FinancialForecast = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: forecasts, refetch } = useQuery({
    queryKey: ['forecasts', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data;
    }
  });

  const generateNewForecast = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-forecast', {
        body: { userId: session?.user.id }
      });

      if (error) throw error;

      toast({
        title: "Forecast Generated",
        description: "New financial forecast has been created",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate forecast",
        variant: "destructive",
      });
    }
  };

  const latestForecast = forecasts?.[0];

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">AI Financial Forecast</h2>
        </div>
        <Button onClick={generateNewForecast} className="hover-scale">
          <TrendingUp className="mr-2 h-4 w-4" />
          Generate New Forecast
        </Button>
      </div>

      {latestForecast ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Predicted Revenue</h3>
              <p className="text-2xl font-bold">
                ${latestForecast.predicted_revenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Next 30 days
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Confidence Level</h3>
              <p className="text-2xl font-bold">
                {latestForecast.confidence_level}%
              </p>
              <p className="text-sm text-muted-foreground">
                Based on historical data
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Key Factors</h3>
            <ul className="space-y-2">
              {Object.entries(latestForecast.factors || {}).map(([key, value]) => (
                <li key={key} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-1 text-yellow-500" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No forecasts generated yet. Click the button above to create your first forecast.
          </p>
        </div>
      )}
    </Card>
  );
};