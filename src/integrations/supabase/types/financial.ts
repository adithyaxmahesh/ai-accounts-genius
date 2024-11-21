import type { Database } from './database.types';

export interface MetricsData {
  revenue: number;
  cashFlowHealth: number;
  goalProgress: number;
  goalName: string;
}

export type FinancialGoal = Database['public']['Tables']['financial_goals']['Row'];
export type RevenueRecord = Database['public']['Tables']['revenue_records']['Row'];