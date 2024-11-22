import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export interface FinancialRecord {
  date: Date
  description: string
  amount: number
  type: 'income' | 'expense'
}

export interface TaxResult {
  totalIncome: number
  totalExpenses: number
  taxableIncome: number
  taxesOwed: number
}

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

export type FinancialGoal = Database['public']['Tables']['financial_goals']['Row']
export type FinancialGoalInsert = Database['public']['Tables']['financial_goals']['Insert']
export type FinancialGoalUpdate = Database['public']['Tables']['financial_goals']['Update']