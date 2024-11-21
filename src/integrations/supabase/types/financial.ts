import { Json } from './database.types';

export interface FinancialGoal {
  id: string;
  user_id: string | null;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialGoalInsert extends Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at' | 'current_amount'> {
  id?: string;
  created_at?: string;
  updated_at?: string;
  current_amount?: number;
}

export interface FinancialGoalUpdate extends Partial<FinancialGoalInsert> {}