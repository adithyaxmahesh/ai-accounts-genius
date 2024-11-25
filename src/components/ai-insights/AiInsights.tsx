import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { InsightsChart } from "./InsightsChart";
import { InsightCard } from "./InsightCard";

export const AiInsights = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: insights, refetch } = useQuery({
    queryKey: ['ai-insights', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const chartData = insights?.map(insight => ({
    date: new Date(insight.created_at).toLocaleDateString(),
    confidence: insight.confidence_score || 0
  })) || [];

  const handleRefreshInsights = async () => {
    try {
      toast({
        title: "Refreshing insights...",
        description: "Analyzing your latest financial data",
      });

      await supabase.functions.invoke('generate-insights', {
        body: { userId: session?.user.id }
      });

      await refetch();

      toast({
        title: "Insights Updated",
        description: "Your financial insights have been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh insights. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-muted hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary animate-pulse" />
          <h2 className="text-xl font-semibold">AI Financial Insights</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-primary/10"
          onClick={handleRefreshInsights}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <InsightsChart chartData={chartData} />

      <div className="grid gap-4">
        {insights?.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </Card>
  );
};