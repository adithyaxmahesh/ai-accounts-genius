import { corsHeaders } from './utils.ts';

const numberPattern = /\$?\d{1,3}(,\d{3})*(\.\d{2})?/;
const expenseKeywords = ['expense', 'payment', 'purchase', 'cost', 'fee', 'charge'];
const revenueKeywords = ['revenue', 'income', 'sale', 'deposit', 'interest'];

export async function processTransactions(lines: string[]) {
  const transactions: any[] = [];
  const findings: string[] = [];

  for (const line of lines) {
    const matches = line.match(numberPattern);
    if (matches) {
      const amount = parseFloat(matches[0].replace(/[$,]/g, ''));
      if (!isNaN(amount)) {
        const isExpense = expenseKeywords.some(keyword => 
          line.toLowerCase().includes(keyword)
        );
        const isRevenue = revenueKeywords.some(keyword => 
          line.toLowerCase().includes(keyword)
        );

        const transactionAmount = isExpense ? -amount : isRevenue ? amount : 0;
        if (transactionAmount !== 0) {
          transactions.push({
            amount: transactionAmount,
            description: line.trim(),
            type: isExpense ? 'expense' : 'revenue',
            line: lines.indexOf(line) + 1
          });

          findings.push(`Detected ${isExpense ? 'expense' : 'revenue'}: $${amount.toLocaleString()} - ${line.trim()}`);
        }
      }
    }
  }

  return { processedTransactions: transactions, extractedFindings: findings };
}