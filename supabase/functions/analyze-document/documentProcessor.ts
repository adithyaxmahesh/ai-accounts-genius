import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './utils.ts';

interface DocumentAnalysis {
  transactions: any[];
  findings: string[];
  riskLevel: string;
  recommendations: string[];
}

export async function processDocument(
  supabaseClient: ReturnType<typeof createClient>,
  document: any,
  fileData: Blob
): Promise<DocumentAnalysis> {
  const text = await fileData.text();
  const lines = text.split('\n');
  
  const findings: string[] = [];
  const transactions: any[] = [];
  let riskLevel = 'low';
  let totalAmount = 0;
  let suspiciousTransactions = 0;

  const numberPattern = /\$?\d{1,3}(,\d{3})*(\.\d{2})?/;

  lines.forEach((line, index) => {
    const matches = line.match(numberPattern);
    if (matches) {
      const amount = parseFloat(matches[0].replace(/[$,]/g, ''));
      if (!isNaN(amount)) {
        totalAmount += amount;
        transactions.push({
          amount,
          description: line.trim(),
          line: index + 1
        });

        if (amount > 10000) {
          findings.push(`Large transaction detected: $${amount.toLocaleString()} on line ${index + 1}`);
          suspiciousTransactions++;
        }
      }
    }
  });

  riskLevel = suspiciousTransactions > 5 ? 'high' : suspiciousTransactions > 2 ? 'medium' : 'low';

  const recommendations = [
    "Review all transactions above $10,000",
    "Verify supporting documentation for large transactions",
    "Consider implementing additional controls for high-value transactions"
  ];

  if (suspiciousTransactions > 0) {
    recommendations.push(`Review ${suspiciousTransactions} flagged transactions`);
  }

  return {
    transactions,
    findings,
    riskLevel,
    recommendations
  };
}

export async function updateFinancialRecords(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  transactions: any[]
) {
  // Update revenue records
  const revenueTransactions = transactions.filter(t => t.amount > 0);
  if (revenueTransactions.length > 0) {
    await supabaseClient.from('revenue_records').insert(
      revenueTransactions.map(t => ({
        user_id: userId,
        amount: t.amount,
        description: t.description,
        category: 'Document Import',
        date: new Date().toISOString().split('T')[0]
      }))
    );
  }

  // Update write-offs
  const writeOffTransactions = transactions.filter(t => t.amount < 0);
  if (writeOffTransactions.length > 0) {
    await supabaseClient.from('write_offs').insert(
      writeOffTransactions.map(t => ({
        user_id: userId,
        amount: Math.abs(t.amount),
        description: t.description,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      }))
    );
  }

  // Update balance sheet
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  if (totalAmount !== 0) {
    await supabaseClient.from('balance_sheet_items').insert({
      user_id: userId,
      category: totalAmount > 0 ? 'asset' : 'liability',
      name: 'Document Import',
      amount: Math.abs(totalAmount),
      description: 'Automatically generated from document analysis'
    });
  }
}