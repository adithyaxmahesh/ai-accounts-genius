import { categorizeTransaction } from './transactionCategories.ts';

const numberPattern = /\$?\d{1,3}(,\d{3})*(\.\d{2})?/;

export async function processTransactions(lines: string[]) {
  const transactions: any[] = [];
  const findings: string[] = [];

  for (const line of lines) {
    const matches = line.match(numberPattern);
    if (matches) {
      const amount = parseFloat(matches[0].replace(/[$,]/g, ''));
      if (!isNaN(amount)) {
        const { type, confidence } = categorizeTransaction(line, amount);
        const transactionAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

        transactions.push({
          amount: transactionAmount,
          description: line.trim(),
          type,
          confidence,
          line: lines.indexOf(line) + 1
        });

        findings.push(
          `Detected ${type} (${(confidence * 100).toFixed(0)}% confidence): ` +
          `$${Math.abs(amount).toLocaleString()} - ${line.trim()}`
        );
      }
    }
  }

  return { processedTransactions: transactions, extractedFindings: findings };
}