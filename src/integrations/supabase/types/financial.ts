import { Database } from './database.types'

export type FinancialGoal = Database['public']['Tables']['financial_goals']['Row']
export type FinancialGoalInsert = Database['public']['Tables']['financial_goals']['Insert']
export type FinancialGoalUpdate = Database['public']['Tables']['financial_goals']['Update']