import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileCheck, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "The AI analysis has been completed successfully.",
      });
      onRefetch();
    },
    onError: (error) => {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to complete the analysis. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          AI Analysis Outcomes
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
                {runAnalysis.isPending ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
            
            {(engagement as any).ai_assurance_analysis?.[0] && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Badge variant={
                    (engagement as any).ai_assurance_analysis[0].risk_score > 0.7 ? "destructive" : 
                    (engagement as any).ai_assurance_analysis[0].risk_score > 0.4 ? "warning" : 
                    "success"
                  }>
                    Risk Score: {((engagement as any).ai_assurance_analysis[0].risk_score * 100).toFixed(0)}%
                  </Badge>
                  <Badge variant="outline">
                    Confidence: {((engagement as any).ai_assurance_analysis[0].confidence_score * 100).toFixed(0)}%
                  </Badge>
                </div>
                
                {(engagement as any).ai_assurance_analysis[0].findings?.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Key Findings
                    </h5>
                    <ul className="space-y-1">
                      {(engagement as any).ai_assurance_analysis[0].findings.map((finding: any, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className={`mt-1 h-2 w-2 rounded-full ${
                            finding.severity === 'high' ? 'bg-red-500' :
                            finding.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          {finding.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(engagement as any).ai_assurance_analysis[0].recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Recommendations
                    </h5>
                    <ul className="space-y-1">
                      {(engagement as any).ai_assurance_analysis[0].recommendations.map((rec: any, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className={`mt-1 h-2 w-2 rounded-full ${
                            rec.priority === 'high' ? 'bg-red-500' :
                            rec.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          {rec.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Progress 
                  value={100 - ((engagement as any).ai_assurance_analysis[0].risk_score * 100)} 
                  className={cn(
                    "h-2",
                    (engagement as any).ai_assurance_analysis[0].risk_score > 0.7 ? "bg-red-500" :
                    (engagement as any).ai_assurance_analysis[0].risk_score > 0.4 ? "bg-yellow-500" :
                    "bg-green-500"
                  )}
                />
              </div>
            )}

            {!(engagement as any).ai_assurance_analysis?.[0] && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No AI analysis available yet.</p>
                <p className="text-sm">Run an analysis to see AI-powered insights here.</p>
              </div>
            )}
          </div>
        ))}

        {(!engagements || engagements.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p>No engagements available yet.</p>
            <p className="text-sm">Create some engagements to see AI-powered insights here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};