import { Json } from './database.types';

export interface AutomaticTaxCalculation {
  id: string;
  user_id: string | null;
  total_income: number;
  total_deductions: number;
  estimated_tax: number;
  potential_savings: number;
  recommendations: Json;
  created_at: string;
  updated_at: string;
}