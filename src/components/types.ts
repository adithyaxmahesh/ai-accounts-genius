export interface ProcessedDocument {
  id: string;
  name: string;
  status: string;
  confidence: number;
  uploadedAt: string;
  documentDate?: string; // Added this field
  type: string;
  storage_path: string;
}
