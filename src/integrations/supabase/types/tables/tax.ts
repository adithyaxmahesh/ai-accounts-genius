import { Json } from '../database.types';

export interface TaxPlanningScenario {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  scenario_data: Json | null;
  estimated_tax_impact: number | null;
  created_at: string;
}

export interface TaxAnalysis {
  id: string;
  user_id: string | null;
  analysis_type: string;
  recommendations: Json | null;
  tax_impact: number | null;
  jurisdiction: string | null;
  created_at: string;
}

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
  tax_planning_scenarios: {
    Row: TaxPlanningScenario;
    Insert: Omit<TaxPlanningScenario, 'id' | 'created_at'>;
    Update: Partial<Omit<TaxPlanningScenario, 'id'>>;
  };
  tax_analysis: {
    Row: TaxAnalysis;
    Insert: Omit<TaxAnalysis, 'id' | 'created_at'>;
    Update: Partial<Omit<TaxAnalysis, 'id'>>;
  };
  tax_deadlines: {
    Row: TaxDeadline;
    Insert: Omit<TaxDeadline, 'id' | 'created_at'>;
    Update: Partial<Omit<TaxDeadline, 'id'>>;
  };
}