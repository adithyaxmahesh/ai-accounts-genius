import { AuditData, Anomaly } from './types.ts';

export function detectAnomalies(audit: AuditData) {
  const anomalies: Anomaly[] = [];
  
  // Time-based analysis
  const timeBasedAnomalies = detectTimeBasedAnomalies(audit.audit_items || []);
  if (timeBasedAnomalies.length > 0) {
    anomalies.push(...timeBasedAnomalies);
  }

  // Amount-based analysis
  const amountBasedAnomalies = detectAmountBasedAnomalies(audit.audit_items || []);
  if (amountBasedAnomalies.length > 0) {
    anomalies.push(...amountBasedAnomalies);
  }

  // Category distribution analysis
  const categoryAnomalies = detectCategoryAnomalies(audit.audit_items || []);
  if (categoryAnomalies.length > 0) {
    anomalies.push(...categoryAnomalies);
  }

  return {
    anomalies,
    count: anomalies.length,
    timestamp: new Date().toISOString()
  };
}

function detectTimeBasedAnomalies(items: any[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  // Group transactions by date
  const dateGroups = items.reduce((groups: any, item: any) => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});

  Object.entries(dateGroups).forEach(([date, transactions]: [string, any]) => {
    if (transactions.length > 20) {
      anomalies.push({
        type: 'time_based',
        description: `Unusual number of transactions (${transactions.length}) on ${date}`,
        severity: 'medium'
      });
    }
  });

  return anomalies;
}

function detectAmountBasedAnomalies(items: any[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const amounts = items.map(item => item.amount);
  
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length
  );

  items.forEach(item => {
    if (Math.abs(item.amount - mean) > stdDev * 3) {
      anomalies.push({
        type: 'amount_based',
        description: `Unusual transaction amount: ${item.amount}`,
        severity: 'high',
        transaction_id: item.id
      });
    }
  });

  return anomalies;
}

function detectCategoryAnomalies(items: any[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  const categoryGroups = items.reduce((groups: any, item: any) => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
    return groups;
  }, {});

  Object.entries(categoryGroups).forEach(([category, transactions]: [string, any]) => {
    const categoryTotal = transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
    const categoryCount = transactions.length;

    if (categoryCount > items.length * 0.5) {
      anomalies.push({
        type: 'category_based',
        description: `Unusual concentration in category: ${category}`,
        severity: 'medium',
        details: { count: categoryCount, total: categoryTotal }
      });
    }
  });

  return anomalies;
}