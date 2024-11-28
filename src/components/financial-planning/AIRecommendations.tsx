import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";

export const AIRecommendations = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: aiRecommendations, refetch: refetchRecommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['ai-budget-recommendations', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_budget_recommendations')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id
  });

  const generateAIRecommendations = async () => {
    try {
      toast({
        title: "Generating Recommendations",
        description: "Analyzing your business financial data...",
      });

      const { error } = await supabase.functions.invoke('analyze-budget', {
        body: { userId: session?.user.id }
      });

      if (error) throw error;

      await refetchRecommendations();

      toast({
        title: "Success",
        description: "Business budget recommendations generated successfully",
      });
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={generateAIRecommendations}
        disabled={isLoadingRecommendations}
      >
        {isLoadingRecommendations ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            Generate Business Recommendations
          </>
        )}
      </Button>

      {aiRecommendations && (
        <div className="space-y-4 mt-4">
          <h3 className="font-semibold">Recommended Budget Allocation</h3>
          <div className="grid gap-4">
            {Object.entries(aiRecommendations.current_spending || {}).map(([category, amount]) => (
              <div key={category} className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">
                    {category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-primary">
                    ${Number(amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {aiRecommendations.recommended_spending && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">AI Recommendations</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {aiRecommendations.recommended_spending}
              </p>
            </div>
          )}
        </div>
      )}

      {!aiRecommendations && !isLoadingRecommendations && (
        <div className="text-center py-8 text-muted-foreground">
          No recommendations generated yet. Click the button above to get started.
        </div>
      )}
    </div>
  );
};