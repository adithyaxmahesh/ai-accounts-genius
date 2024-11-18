import { Database } from './generated';

export type TaxDeadline = Database['public']['Tables']['tax_deadlines']['Row'];
export type TaxPlanningScenario = Database['public']['Tables']['tax_planning_scenarios']['Row'];
export type TaxAnalysis = Database['public']['Tables']['tax_analysis']['Row'];