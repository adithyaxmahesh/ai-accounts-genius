import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileCheck, AlertTriangle, AlertCircle, CheckCircle2, 
  Loader2, ShieldAlert, Scale, FileText, BarChart3 
} from "lucide-react";
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
        description: "The professional analysis has been completed successfully.",
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

  const renderAnalysisContent = (engagement: any) => {
    const analysis = engagement.ai_assurance_analysis?.[0];
    
    if (!analysis) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p>No professional analysis available yet.</p>
          <p className="text-sm">Run an analysis to see detailed CPA insights.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Badge variant={
            analysis.risk_score > 0.7 ? "destructive" : 
            analysis.risk_score > 0.4 ? "warning" : 
            "success"
          } className="flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            Risk Assessment: {(analysis.risk_score * 100).toFixed(0)}%
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Scale className="h-3 w-3" />
            Materiality Score: {(analysis.confidence_score * 100).toFixed(0)}%
          </Badge>
        </div>
        
        {analysis.findings?.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium flex items-center gap-2 text-primary">
              <FileText className="h-4 w-4" />
              Material Findings
            </h5>
            <div className="space-y-3">
              {analysis.findings.map((finding: any, idx: number) => (
                <div key={idx} className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      finding.severity === 'high' ? 'bg-red-500' :
                      finding.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    )} />
                    <div>
                      <p className="font-medium">{finding.description}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {finding.category}
                        </Badge>
                        <Badge variant={
                          finding.severity === 'high' ? "destructive" :
                          finding.severity === 'medium' ? "warning" :
                          "outline"
                        } className="text-xs">
                          {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)} Risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {analysis.recommendations?.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium flex items-center gap-2 text-primary">
              <BarChart3 className="h-4 w-4" />
              Professional Recommendations
            </h5>
            <div className="space-y-3">
              {analysis.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      rec.priority === 'high' ? 'bg-red-500' :
                      rec.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    )} />
                    <div>
                      <p className="font-medium">{rec.description}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {rec.area}
                        </Badge>
                        <Badge variant={
                          rec.priority === 'high' ? "destructive" :
                          rec.priority === 'medium' ? "warning" :
                          "outline"
                        } className="text-xs">
                          {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Progress 
          value={100 - (analysis.risk_score * 100)} 
          className={cn(
            "h-2",
            analysis.risk_score > 0.7 ? "bg-red-500" :
            analysis.risk_score > 0.4 ? "bg-yellow-500" :
            "bg-green-500"
          )}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          Professional Assurance Analysis
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
                  "Run Professional Analysis"
                )}
              </Button>
            </div>
            
            {renderAnalysisContent(engagement)}
          </div>
        ))}

        {(!engagements || engagements.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p>No engagements available yet.</p>
            <p className="text-sm">Create some engagements to see professional CPA insights.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};