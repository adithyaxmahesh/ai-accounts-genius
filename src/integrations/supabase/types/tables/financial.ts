import { Json } from '../database.types';

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

export interface BankConnection {
  id: string;
  user_id: string | null;
  bank_name: string;
  account_number: string;
  routing_number: string;
  created_at: string;
}

export interface FinancialTables {
  financial_goals: {
    Row: FinancialGoal;
    Insert: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<Omit<FinancialGoal, 'id'>>;
  };
  bank_connections: {
    Row: BankConnection;
    Insert: Omit<BankConnection, 'id' | 'created_at'>;
    Update: Partial<Omit<BankConnection, 'id'>>;
  };
}