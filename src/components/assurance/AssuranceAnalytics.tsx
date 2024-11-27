import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AssuranceProcessSteps } from "./AssuranceProcessSteps";
import { AssuranceMetricsCards } from "./AssuranceMetricsCards";
import { AssuranceRecentActivity } from "./AssuranceRecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, FileCheck, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type AssuranceEngagement = Tables<"assurance_engagements">;

export const AssuranceAnalytics = () => {
  const { toast } = useToast();

  const { data: engagements, isLoading, refetch } = useQuery({
    queryKey: ["assurance-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assurance_engagements")
        .select("*, assurance_procedures(*), ai_assurance_analysis(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AssuranceEngagement[];
    },
  });

  const runAnalysis = useMutation({
    mutationFn: async (engagementId: string) => {
      const { data: procedures } = await supabase
        .from("assurance_procedures")
        .select("*")
        .eq("engagement_id", engagementId);

      const { data: evidence } = await supabase
        .from("assurance_evidence")
        .select("*")
        .eq("engagement_id", engagementId);

      const response = await supabase.functions.invoke("analyze-assurance", {
        body: {
          engagementId,
          procedureId: procedures?.[0]?.id,
          evidenceData: evidence,
          documentText: "Sample document text" // You would want to get actual document text here
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Analysis Complete",
        description: "The AI analysis has been completed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to complete the analysis. Please try again.",
        variant: "destructive",
      });
      console.error("Analysis error:", error);
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  // Calculate analytics
  const totalEngagements = engagements?.length || 0;
  const completedEngagements = engagements?.filter(e => e.status === 'completed').length || 0;
  const inProgressEngagements = engagements?.filter(e => e.status === 'in_progress').length || 0;
  const highRiskEngagements = engagements?.filter(e => 
    e.risk_assessment && (e.risk_assessment as any).level === 'high'
  ).length || 0;
  const compliantEngagements = engagements?.filter(e => 
    e.findings && (e.findings as any[]).length === 0
  ).length || 0;
  const complianceRate = totalEngagements ? (compliantEngagements / totalEngagements) * 100 : 0;

  // Get the latest AI analysis outcomes
  const aiAnalysisOutcomes = engagements?.map(engagement => {
    const analysis = (engagement as any).ai_assurance_analysis?.[0];
    return {
      engagementId: engagement.id,
      clientName: engagement.client_name,
      riskScore: analysis?.risk_score || 0,
      confidenceScore: analysis?.confidence_score || 0,
      findings: analysis?.findings || [],
      recommendations: analysis?.recommendations || [],
    };
  }).filter(outcome => outcome.findings.length > 0 || outcome.recommendations.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Assurance Process & Analytics</h2>
          <p className="text-muted-foreground">Understanding the assurance workflow and engagement metrics</p>
        </div>
      </div>

      <div className="grid gap-6">
        <AssuranceProcessSteps />
        
        <AssuranceMetricsCards 
          totalEngagements={totalEngagements}
          completedEngagements={completedEngagements}
          inProgressEngagements={inProgressEngagements}
          complianceRate={complianceRate}
          highRiskEngagements={highRiskEngagements}
        />

        <div className="grid gap-4 md:grid-cols-2">
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

          <AssuranceRecentActivity engagements={engagements || []} />
        </div>
      </div>
    </div>
  );
};