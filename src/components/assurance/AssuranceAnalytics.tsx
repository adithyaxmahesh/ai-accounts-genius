import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AssuranceProcessSteps } from "./AssuranceProcessSteps";
import { AssuranceMetricsCards } from "./AssuranceMetricsCards";
import { AssuranceRecentActivity } from "./AssuranceRecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, FileCheck, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

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

  // Automatically trigger AI analysis for engagements without analysis
  useEffect(() => {
    const analyzeEngagements = async () => {
      if (!engagements) return;
      
      for (const engagement of engagements) {
        const needsAnalysis = !(engagement as any).ai_assurance_analysis?.length;
        
        if (needsAnalysis) {
          try {
            await supabase.functions.invoke('analyze-assurance', {
              body: { 
                engagementId: engagement.id,
                clientName: engagement.client_name,
                engagementType: engagement.engagement_type,
                status: engagement.status,
                findings: engagement.findings,
                riskAreas: engagement.risk_areas
              }
            });
            
            toast({
              title: "AI Analysis Complete",
              description: `Analysis completed for ${engagement.client_name}`,
            });
            
            refetch();
          } catch (error) {
            console.error('Error analyzing engagement:', error);
          }
        }
      }
    };

    analyzeEngagements();
  }, [engagements]);

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
              {aiAnalysisOutcomes?.map((outcome, index) => (
                <div key={outcome.engagementId} className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{outcome.clientName}</h4>
                    <div className="flex gap-2">
                      <Badge variant={outcome.riskScore > 0.7 ? "destructive" : outcome.riskScore > 0.4 ? "warning" : "success"}>
                        Risk Score: {(outcome.riskScore * 100).toFixed(0)}%
                      </Badge>
                      <Badge variant="outline">
                        Confidence: {(outcome.confidenceScore * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {outcome.findings.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Key Findings
                        </h5>
                        <ul className="space-y-1">
                          {outcome.findings.map((finding: any, idx: number) => (
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
                    
                    {outcome.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Recommendations
                        </h5>
                        <ul className="space-y-1">
                          {outcome.recommendations.map((rec: any, idx: number) => (
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
                  </div>

                  <Progress 
                    value={100 - (outcome.riskScore * 100)} 
                    className="h-2"
                    // Use className instead of indicatorClassName
                    className={`h-2 ${
                      outcome.riskScore > 0.7 ? 'bg-red-500' :
                      outcome.riskScore > 0.4 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                  />
                </div>
              ))}

              {(!aiAnalysisOutcomes || aiAnalysisOutcomes.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mb-4" />
                  <p>No AI analysis outcomes available yet.</p>
                  <p className="text-sm">Complete some engagements to see AI-powered insights here.</p>
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