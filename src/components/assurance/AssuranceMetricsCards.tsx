import { useState } from "react";
import { Shield, FileCheck, TrendingUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricsDialog } from "./MetricsDialog";
import { DetailedInsight, MetricsProps } from "./types";
import { getDetailedContent } from "./utils";

export const AssuranceMetricsCards = ({
  totalEngagements,
  completedEngagements,
  inProgressEngagements,
  complianceRate,
  highRiskEngagements
}: MetricsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedEngagementId, setSelectedEngagementId] = useState<string | null>(null);

  const { data: detailedInsights } = useQuery({
    queryKey: ['detailed-insights', selectedEngagementId],
    queryFn: async () => {
      if (!selectedEngagementId) return null;
      
      const { data, error } = await supabase
        .from('assurance_detailed_insights')
        .select('*')
        .eq('engagement_id', selectedEngagementId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedEngagementId
  });

  const content: DetailedInsight = detailedInsights || getDetailedContent(selectedMetric || '', {
    totalEngagements,
    completedEngagements,
    inProgressEngagements,
    complianceRate,
    highRiskEngagements
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-accent/5"
          onClick={() => setSelectedMetric('overview')}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Assurance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Engagements</span>
              <span className="text-2xl font-bold">{totalEngagements}</span>
            </div>
            <Progress value={completedEngagements / totalEngagements * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-accent/5"
          onClick={() => setSelectedMetric('compliance')}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round(complianceRate)}%</p>
            <p className="text-sm text-muted-foreground mt-2">
              Overall compliance rate
            </p>
            <div className="mt-4 flex items-center gap-2 text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{highRiskEngagements} high-risk items</span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-accent/5"
          onClick={() => setSelectedMetric('status')}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Engagement Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Completed</span>
                </div>
                <span>{completedEngagements}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>In Progress</span>
                </div>
                <span>{inProgressEngagements}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MetricsDialog 
        content={content}
        open={!!selectedMetric} 
        onOpenChange={(open) => !open && setSelectedMetric(null)}
      />
    </>
  );
};