import type { Database } from './database.types';

export interface MetricsData {
  revenue: number;
  cashFlowHealth: number;
  goalProgress: number;
  goalName: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string | null;
  name: string;
  target_amount: number;
  current_amount: number | null;
  start_date: string;
  end_date: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface RevenueRecord {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
  user_id: string | null;
}