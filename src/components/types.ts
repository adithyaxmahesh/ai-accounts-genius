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