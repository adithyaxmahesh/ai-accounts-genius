import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Financial Goals Types
export interface FinancialGoal {
  id: string
  user_id: string | null
  name: string
  target_amount: number
  current_amount: number | null
  start_date: string
  end_date: string
  category: string
  created_at: string
  updated_at: string
}

export interface FinancialGoalInsert extends Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at' | 'current_amount' | 'start_date'> {
  id?: string
  created_at?: string
  updated_at?: string
  current_amount?: number
  start_date?: string
}

export interface FinancialGoalUpdate extends Partial<FinancialGoalInsert> {}