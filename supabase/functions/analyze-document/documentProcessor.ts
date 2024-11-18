import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './utils.ts';

interface DocumentAnalysis {
  transactions: any[];
  findings: string[];
  riskLevel: string;
  recommendations: string[];
  writeOffs: WriteOff[];
}

interface WriteOff {
  amount: number;
  description: string;
  taxCodeId?: string;
  category: string;
}

async function findMatchingTaxCode(supabaseClient: ReturnType<typeof createClient>, description: string, amount: number): Promise<string | undefined> {
  const keywords = {
    'Transportation': ['fuel', 'car', 'vehicle', 'mileage', 'parking', 'toll'],
    'Office': ['supplies', 'paper', 'printer', 'desk', 'chair', 'computer'],
    'Marketing': ['advertising', 'promotion', 'campaign', 'marketing'],
    'Travel': ['hotel', 'flight', 'accommodation', 'travel'],
    'Equipment': ['machine', 'equipment', 'tool', 'hardware'],
    'Services': ['consulting', 'service', 'subscription', 'software']
  };

  const descLower = description.toLowerCase();
  let matchedCategory = '';

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => descLower.includes(word))) {
      matchedCategory = category;
      break;
    }
  }

  if (matchedCategory) {
    const { data: taxCode } = await supabaseClient
      .from('tax_codes')
      .select('id')
      .eq('expense_category', matchedCategory)
      .single();

    return taxCode?.id;
  }
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
  const writeOffs: WriteOff[] = [];
  let riskLevel = 'low';
  let totalAmount = 0;

  const numberPattern = /\$?\d{1,3}(,\d{3})*(\.\d{2})?/;
  const expenseKeywords = ['expense', 'payment', 'purchase', 'cost', 'fee', 'charge'];

  for (const line of lines) {
    const matches = line.match(numberPattern);
    if (matches) {
      const amount = parseFloat(matches[0].replace(/[$,]/g, ''));
      if (!isNaN(amount)) {
        const isExpense = expenseKeywords.some(keyword => 
          line.toLowerCase().includes(keyword)
        );

        if (isExpense) {
          const taxCodeId = await findMatchingTaxCode(supabaseClient, line, amount);
          const category = taxCodeId ? 'Categorized' : 'Uncategorized';
          
          writeOffs.push({
            amount,
            description: line.trim(),
            taxCodeId,
            category
          });

          findings.push(`Potential write-off detected: $${amount.toLocaleString()} - ${category}`);
        }

        transactions.push({
          amount: isExpense ? -amount : amount,
          description: line.trim(),
          line: lines.indexOf(line) + 1
        });

        totalAmount += amount;
      }
    }
  }

  const recommendations = [
    "Review identified write-offs for accuracy",
    "Verify tax code assignments",
    "Collect supporting documentation for write-offs"
  ];

  return {
    transactions,
    findings,
    riskLevel,
    recommendations,
    writeOffs
  };
}

export async function updateFinancialRecords(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  analysis: DocumentAnalysis
) {
  // Update write-offs
  if (analysis.writeOffs.length > 0) {
    await supabaseClient.from('write_offs').insert(
      analysis.writeOffs.map(writeOff => ({
        user_id: userId,
        amount: writeOff.amount,
        description: writeOff.description,
        tax_code_id: writeOff.taxCodeId,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      }))
    );
  }

  // Update revenue records for non-expense transactions
  const revenueTransactions = analysis.transactions.filter(t => t.amount > 0);
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

  // Update balance sheet
  const totalAmount = analysis.transactions.reduce((sum, t) => sum + t.amount, 0);
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