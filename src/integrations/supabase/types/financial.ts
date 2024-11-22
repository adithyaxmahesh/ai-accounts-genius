export interface FinancialHealthMetrics {
  id: string;
  user_id: string | null;
  health_score: number | null;
  cash_flow_score: number | null;
  debt_ratio: number | null;
  current_ratio: number | null;
  metrics_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}