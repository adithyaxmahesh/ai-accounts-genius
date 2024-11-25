export interface ProcessedDocument {
  id: string;
  name: string;
  status: string;
  confidence: number;
  uploadedAt: string;
  documentDate?: string;
  type: string;
  storage_path: string;
  extracted_data?: {
    writeOffs?: Array<{
      description: string;
      amount: number;
      category?: string;
      taxCodeId?: string;
      status?: string;
    }>;
  };
}

export interface WriteOff {
  id: string;
  amount: number;
  description: string;
  date: string;
  status?: string;
  tax_codes?: {
    code: string;
    description: string;
    state: string;
    expense_category: string;
  };
  user_id?: string;
}

export interface TaxCode {
  id: string;
  code: string;
  description: string;
  category: string;
  state?: string;
  expense_category?: string;
  deduction_type: string;
}