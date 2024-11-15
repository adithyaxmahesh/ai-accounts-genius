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