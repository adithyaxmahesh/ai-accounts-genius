import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AssuranceProcessSteps } from "./AssuranceProcessSteps";
import { AssuranceMetricsCards } from "./AssuranceMetricsCards";
import { AssuranceRecentActivity } from "./AssuranceRecentActivity";
import { AIAnalysisCard } from "./AIAnalysisCard";

export const AssuranceAnalytics = () => {
  const { data: engagements, isLoading, refetch } = useQuery({
    queryKey: ["assurance-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assurance_engagements")
        .select("*, assurance_procedures(*), ai_assurance_analysis(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

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
          <AIAnalysisCard 
            engagements={engagements || []}
            onRefetch={refetch}
          />
          <AssuranceRecentActivity engagements={engagements || []} />
        </div>
      </div>
    </div>
  );
};