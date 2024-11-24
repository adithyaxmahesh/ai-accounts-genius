import { categorizeTransaction } from './transactionCategories.ts';

export async function processCSV(text: string) {
  const lines = text.split('\n').map(line => line.split(','));
  const headers = lines[0].map(h => h.toLowerCase().trim());
  const rows = lines.slice(1);
  
  const amountIndex = headers.findIndex(h => 
    h.includes('amount') || h.includes('value') || h.includes('sum')
  );
  const descriptionIndex = headers.findIndex(h => 
    h.includes('description') || h.includes('details') || h.includes('memo')
  );
  
  if (amountIndex === -1 || descriptionIndex === -1) {
    throw new Error('CSV must contain amount and description columns');
  }

  const transactions = [];
  const findings = [];

  for (const row of rows) {
    if (row.length <= Math.max(amountIndex, descriptionIndex)) continue;
    
    const amount = parseFloat(row[amountIndex].replace(/[$,]/g, ''));
    const description = row[descriptionIndex].trim();
    
    if (!isNaN(amount) && description) {
      const { type, confidence } = categorizeTransaction(description, amount);
      const transactionAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

      transactions.push({
        amount: transactionAmount,
        description,
        type,
        confidence,
        row: rows.indexOf(row) + 2 // +2 for header row and 0-based index
      });

      findings.push(
        `Detected ${type} (${(confidence * 100).toFixed(0)}% confidence): ` +
        `$${Math.abs(amount).toLocaleString()} - ${description}`
      );
    }
  }

  return { processedTransactions: transactions, extractedFindings: findings };
}