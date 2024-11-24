import { DetailedInsight, MetricsProps } from "./types";

export const getDetailedContent = (metric: string, props: MetricsProps): DetailedInsight => {
  const {
    totalEngagements,
    completedEngagements,
    inProgressEngagements,
    complianceRate,
    highRiskEngagements
  } = props;

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