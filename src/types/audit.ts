export interface AuditItem {
  id: string;
  audit_id: string;
  category: string;
  description: string;
  amount: number;
  status: 'pending' | 'flagged' | 'approved';
  created_at: string;
}

export interface AuditReport {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  findings: any[];
  risk_level: 'low' | 'medium' | 'high';
  recommendations: string[];
  audit_items: AuditItem[];
}