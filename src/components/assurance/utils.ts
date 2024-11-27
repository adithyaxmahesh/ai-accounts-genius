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

export const getEngagementAnalysisPrompt = (type: string): string => {
  switch (type) {
    case 'internal_control':
      return `Analyze internal control effectiveness focusing on:
        - Control environment assessment
        - Risk assessment procedures
        - Control activities evaluation
        - Information and communication systems
        - Monitoring activities`;
    
    case 'operational':
      return `Conduct operational review focusing on:
        - Process efficiency analysis
        - Resource utilization assessment
        - Operational bottlenecks identification
        - Performance metrics evaluation
        - Workflow optimization opportunities`;
    
    case 'compliance':
      return `Perform compliance review focusing on:
        - Regulatory requirements adherence
        - Internal policy compliance
        - Documentation completeness
        - Reporting requirements
        - Compliance risk assessment`;
    
    case 'performance':
      return `Conduct performance assessment focusing on:
        - KPI achievement analysis
        - Performance metrics evaluation
        - Efficiency measurements
        - Quality standards compliance
        - Performance improvement opportunities`;
    
    case 'process':
      return `Evaluate process effectiveness focusing on:
        - Process flow analysis
        - Bottleneck identification
        - Resource allocation efficiency
        - Process documentation review
        - Improvement opportunities`;
    
    case 'risk':
      return `Perform risk assessment focusing on:
        - Risk identification
        - Impact analysis
        - Probability assessment
        - Control effectiveness
        - Mitigation strategies`;
        
    default:
      return `Perform general assurance analysis focusing on:
        - Overall effectiveness
        - Risk identification
        - Control assessment
        - Improvement opportunities`;
  }
};