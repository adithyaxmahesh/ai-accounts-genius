export interface AuditReport {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
  findings?: string[];
  risk_level?: string;
  recommendations?: string[];
  user_id?: string;
  document_id?: string;
  audit_objective?: string;
  stakeholders?: string[];
  engagement_letter?: any;
  materiality_threshold?: number;
  internal_control_assessment?: any;
  evidence_collected?: any;
  audit_assertions?: any;
  audit_opinion?: string;
  automated_analysis?: any;
  risk_scores?: {
    critical?: number;
    major?: number;
    moderate?: number;
  };
  control_effectiveness?: Record<string, string>;
  anomaly_detection?: any;
}

export interface AuditRiskAssessment {
  category: string;
  likelihood: number;
  impact: number;
  mitigation_steps?: any;
}