import { AuditData, RiskScores } from './types';

export async function performRiskAssessment(audit: AuditData): Promise<RiskScores> {
  const riskFactors = {
    transactionVolume: 0,
    largeTransactions: 0,
    unusualPatterns: 0,
    controlWeaknesses: 0
  };

  // Analyze transaction volume
  if (audit.audit_items && audit.audit_items.length > 100) {
    riskFactors.transactionVolume = 0.4;
  }

  // Check for large transactions
  const largeTransactions = audit.audit_items?.filter(item => 
    item.amount > 10000
  ).length || 0;
  riskFactors.largeTransactions = Math.min(largeTransactions * 0.1, 0.5);

  // Detect unusual patterns using statistical analysis
  const amounts = audit.audit_items?.map(item => item.amount) || [];
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length
  );
  
  const unusualCount = amounts.filter(amount => 
    Math.abs(amount - mean) > stdDev * 2
  ).length;
  riskFactors.unusualPatterns = Math.min(unusualCount * 0.05, 0.3);

  return {
    factors: riskFactors,
    overallScore: Object.values(riskFactors).reduce((a, b) => a + b, 0),
    timestamp: new Date().toISOString()
  };
}