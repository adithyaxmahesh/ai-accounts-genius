export interface DetailedInsight {
  title: string;
  description: string;
  metrics?: {
    [key: string]: string | number | Record<string, number>;
  };
  recommendations?: string[];
}

export interface MetricsProps {
  totalEngagements: number;
  completedEngagements: number;
  inProgressEngagements: number;
  complianceRate: number;
  highRiskEngagements: number;
}