import { Database } from './database.types';

export type TaxDeadline = Database['public']['Tables']['tax_deadlines']['Row'];
export type TaxPlanningScenario = Database['public']['Tables']['tax_planning_scenarios']['Row'];
export type TaxAnalysis = Database['public']['Tables']['tax_analysis']['Row'];
export type AutomaticTaxCalculation = {
  id: string;
  user_id: string | null;
  total_income: number;
  total_deductions: number;
  estimated_tax: number;
  potential_savings: number;
  recommendations: {
    missing_docs?: string[];
    tax_saving_opportunities?: string[];
    compliance_warnings?: string[];
  };
  created_at: string;
  updated_at: string;
};
export type WriteOff = Database['public']['Tables']['write_offs']['Row'];