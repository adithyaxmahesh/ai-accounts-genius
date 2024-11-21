import { Json } from '../database.types';

export interface TaxDeadline {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  status: string | null;
  created_at: string;
}

export interface TaxTables {
  tax_deadlines: {
    Row: TaxDeadline;
    Insert: Omit<TaxDeadline, 'id' | 'created_at'>;
    Update: Partial<Omit<TaxDeadline, 'id'>>;
  };
}