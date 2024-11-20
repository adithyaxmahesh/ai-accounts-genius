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

export interface TaxSummaryProps {
  analysis: any;
}

export interface TaxBreakdownProps {
  analysis: any;
}

export interface TaxCode {
  id: string;
  code: string;
  description: string;
  category: string;
  deduction_type: string;
  created_at: string;
  state: string | null;
  expense_category: string | null;
}

export interface WriteOff {
  id: string;
  tax_code_id: string | null;
  amount: number;
  description: string;
  date: string;
  status: string | null;
  created_at: string;
  user_id: string | null;
  tax_codes: TaxCode | null;
}

export interface AutomaticTaxCalculation {
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
}