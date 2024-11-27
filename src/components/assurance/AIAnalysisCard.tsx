import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisContent } from "./analysis/AnalysisContent";
import { NoAnalysisState } from "./analysis/NoAnalysisState";

interface AIAnalysisCardProps {
  engagements: any[];
  onRefetch: () => void;
}

export const AIAnalysisCard = ({ engagements, onRefetch }: AIAnalysisCardProps) => {
  const { toast } = useToast();

  const runAnalysis = useMutation({
    mutationFn: async (engagementId: string) => {
      const { data, error } = await supabase.functions.invoke("analyze-assurance", {
        body: { engagementId }
      });

      if (error) {
        console.error("Analysis error:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("No data received from analysis");
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "The analysis has been completed successfully.",
      });
      onRefetch();
    },
    onError: (error) => {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to complete the analysis. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          AI Assurance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {engagements?.map((engagement) => (
          <div key={engagement.id} className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{engagement.client_name}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => runAnalysis.mutate(engagement.id)}
                disabled={runAnalysis.isPending}
              >
                {runAnalysis.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Run Analysis"
                )}
              </Button>
            </div>
            
            {engagement.ai_assurance_analysis?.[0] ? (
              <AnalysisContent analysis={engagement.ai_assurance_analysis[0]} />
            ) : (
              <NoAnalysisState />
            )}
          </div>
        ))}

        {(!engagements || engagements.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p>No engagements available yet.</p>
            <div className="text-sm">Create some engagements to see AI insights.</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};