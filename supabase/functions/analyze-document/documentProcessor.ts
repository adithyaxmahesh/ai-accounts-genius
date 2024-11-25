import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { processTransactions } from './transactionProcessor.ts';
import { processCSV } from './csvProcessor.ts';
import { processEquity } from './equityProcessor.ts';
import { processIncomeStatement } from './incomeProcessor.ts';

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

export async function processDocument(
  supabaseClient: ReturnType<typeof createClient>,
  document: any,
  fileData: Blob
): Promise<DocumentAnalysis> {
  const text = await fileData.text();
  const findings: string[] = [];
  let transactions: any[] = [];
  const writeOffs: WriteOff[] = [];
  let riskLevel = 'low';

  try {
    // Process based on file type
    const isCSV = document.original_filename.toLowerCase().endsWith('.csv');
    const { processedTransactions, extractedFindings } = isCSV 
      ? await processCSV(text)
      : await processTransactions(text.split('\n'));
    
    transactions = processedTransactions;
    findings.push(...extractedFindings);

    // Process equity and income statements
    await processEquity(supabaseClient, document.user_id, transactions);
    await processIncomeStatement(supabaseClient, document.user_id, transactions);

    // Create write-offs from expense transactions
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    for (const transaction of expenseTransactions) {
      const taxCodeId = await findMatchingTaxCode(
        supabaseClient, 
        transaction.description, 
        Math.abs(transaction.amount)
      );
      
      writeOffs.push({
        amount: Math.abs(transaction.amount),
        description: transaction.description,
        taxCodeId,
        category: taxCodeId ? 'Categorized' : 'Uncategorized'
      });

      findings.push(
        `Potential write-off detected: $${Math.abs(transaction.amount).toLocaleString()} - ` +
        `${taxCodeId ? 'Categorized' : 'Uncategorized'}`
      );
    }

  } catch (error) {
    console.error('Error processing document:', error);
    findings.push('Error processing document: ' + error.message);
    riskLevel = 'high';
  }

  return {
    transactions,
    findings,
    riskLevel,
    recommendations: [
      "Review generated income statement for accuracy",
      "Verify revenue and expense classifications",
      "Consider any missing transactions"
    ],
    writeOffs
  };
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