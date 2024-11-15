export interface ProcessedDocument {
  id: string;
  name: string;
  status: string;
  confidence: number;
  uploadedAt: string;
  type: string;
  extracted_data?: any;
}