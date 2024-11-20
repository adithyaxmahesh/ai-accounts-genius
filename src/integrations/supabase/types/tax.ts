import { Database } from './database.types';

export type TaxDeadline = Database['public']['Tables']['tax_deadlines']['Row'];
export type TaxPlanningScenario = Database['public']['Tables']['tax_planning_scenarios']['Row'];
export type TaxAnalysis = Database['public']['Tables']['tax_analysis']['Row'];
export type AutomaticTaxCalculation = Database['public']['Tables']['automatic_tax_calculations']['Row'];