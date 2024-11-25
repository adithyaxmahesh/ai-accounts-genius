import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AssuranceProcessSteps } from "./AssuranceProcessSteps";
import { AssuranceMetricsCards } from "./AssuranceMetricsCards";
import { AssuranceRecentActivity } from "./AssuranceRecentActivity";
import { AIAnalysisCard } from "./AIAnalysisCard";
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
          <AIAnalysisCard aiAnalysisOutcomes={aiAnalysisOutcomes || []} />
          <AssuranceRecentActivity engagements={engagements || []} />
        </div>
      </div>
    </div>
  );
};