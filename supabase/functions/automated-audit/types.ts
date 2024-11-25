export interface AuditData {
  id: string;
  title: string;
  description?: string;
  audit_items?: Array<{
    id: string;
    amount: number;
    category: string;
    created_at: string;
  }>;
}

export interface RiskScores {
  factors: {
    transactionVolume: number;
    largeTransactions: number;
    unusualPatterns: number;
    controlWeaknesses: number;
  };
  overallScore: number;
  timestamp: string;
}

export interface ControlTest {
  name: string;
  result: {
    score: number;
    findings: string[];
  };
  weight: number;
}

export interface Anomaly {
  type: string;
  description: string;
  severity: string;
  transaction_id?: string;
  details?: {
    count: number;
    total: number;
  };
}