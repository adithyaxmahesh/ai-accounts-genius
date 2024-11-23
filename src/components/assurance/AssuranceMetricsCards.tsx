import { useState } from "react";
import { Shield, FileCheck, TrendingUp, CheckCircle2, Clock, AlertCircle, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MetricsProps {
  totalEngagements: number;
  completedEngagements: number;
  inProgressEngagements: number;
  complianceRate: number;
  highRiskEngagements: number;
}

interface DetailedInsight {
  title: string;
  description: string;
  metrics?: Record<string, any>;
  recommendations?: string[];
}

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

  const getDetailedContent = (metric: string): DetailedInsight => {
    switch (metric) {
      case 'overview':
        return {
          title: "Assurance Overview Details",
          description: `Detailed analysis of ${totalEngagements} total engagements shows ${completedEngagements} completed and ${inProgressEngagements} in progress.`,
          metrics: {
            completionRate: `${((completedEngagements / totalEngagements) * 100).toFixed(1)}%`,
            averageCompletionTime: "14 days",
            qualityScore: "92%"
          },
          recommendations: [
            "Focus on completing in-progress engagements",
            "Review resource allocation for optimal efficiency",
            "Consider implementing automated progress tracking"
          ]
        };
      case 'compliance':
        return {
          title: "Compliance Status Analysis",
          description: `Current compliance rate of ${Math.round(complianceRate)}% with ${highRiskEngagements} high-risk items identified.`,
          metrics: {
            riskDistribution: {
              high: highRiskEngagements,
              medium: Math.floor(totalEngagements * 0.3),
              low: Math.floor(totalEngagements * 0.5)
            },
            complianceScore: complianceRate.toFixed(1)
          },
          recommendations: [
            "Address high-risk items immediately",
            "Schedule regular compliance reviews",
            "Update compliance documentation"
          ]
        };
      case 'status':
        return {
          title: "Engagement Status Breakdown",
          description: "Detailed view of engagement progress and status distribution.",
          metrics: {
            completed: completedEngagements,
            inProgress: inProgressEngagements,
            pending: totalEngagements - (completedEngagements + inProgressEngagements)
          },
          recommendations: [
            "Prioritize near-completion engagements",
            "Review blocked or delayed engagements",
            "Optimize resource allocation"
          ]
        };
      default:
        return {
          title: "Engagement Insights",
          description: "Select a metric card to view detailed insights."
        };
    }
  };

  const content = detailedInsights || getDetailedContent(selectedMetric || '');

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

      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{content.title}</DialogTitle>
            <button
              onClick={() => setSelectedMetric(null)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
          <DialogDescription>
            <div className="space-y-6">
              <p className="text-base text-muted-foreground">{content.description}</p>
              
              {content.metrics && (
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(content.metrics).map(([key, value]) => (
                    <div key={key} className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium capitalize mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      {typeof value === 'object' ? (
                        <div className="space-y-2">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <div key={subKey} className="flex justify-between">
                              <span className="text-sm capitalize">{subKey}</span>
                              <span className="font-medium">{subValue}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-2xl font-bold">{value}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {content.recommendations && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {content.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};