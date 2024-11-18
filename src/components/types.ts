export interface ProcessedDocument {
  id: string;
  name: string;
  status: string;
  confidence: number;
  uploadedAt: string;
  type: string;
  storage_path?: string;
  extracted_data?: any;
}

export interface TaxDeadline {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: string;
  created_at: string;
}

export interface TaxPlanningScenario {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  scenario_data?: any;
  estimated_tax_impact?: number;
  created_at: string;
}

export interface TaxSummaryProps {
  analysis: any;
}

export interface TaxBreakdownProps {
  analysis: any;
}