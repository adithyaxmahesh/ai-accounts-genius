export const revenueKeywords = [
  'revenue',
  'income',
  'sale',
  'deposit',
  'payment received',
  'credit',
  'earnings',
  'profit',
  'commission',
  'interest earned'
];

export const expenseKeywords = [
  'expense',
  'payment',
  'purchase',
  'cost',
  'fee',
  'charge',
  'debit',
  'bill',
  'invoice',
  'rent',
  'salary',
  'utilities'
];

export const categorizeTransaction = (description: string, amount: number): {
  type: 'revenue' | 'expense';
  confidence: number;
} => {
  const descLower = description.toLowerCase();
  
  // Check for revenue keywords
  const revenueMatches = revenueKeywords.filter(keyword => 
    descLower.includes(keyword)
  ).length;
  
  // Check for expense keywords
  const expenseMatches = expenseKeywords.filter(keyword => 
    descLower.includes(keyword)
  ).length;
  
  // Calculate confidence based on keyword matches
  const revenueConfidence = revenueMatches / revenueKeywords.length;
  const expenseConfidence = expenseMatches / expenseKeywords.length;
  
  // If we have keyword matches, use them
  if (revenueMatches > 0 || expenseMatches > 0) {
    if (revenueConfidence > expenseConfidence) {
      return { type: 'revenue', confidence: revenueConfidence };
    } else {
      return { type: 'expense', confidence: expenseConfidence };
    }
  }
  
  // Fallback to amount-based categorization with lower confidence
  return {
    type: amount >= 0 ? 'revenue' : 'expense',
    confidence: 0.5
  };
};