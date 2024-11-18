import { supabase } from "@/integrations/supabase/client";
import type { ExpensePattern } from "@/integrations/supabase/types/expense-patterns";

export interface CategoryPattern {
  pattern: string;
  category: string;
  confidence: number;
  isExpense: boolean;
}

export const categorizeTransaction = async (description: string, amount: number) => {
  const { data: patterns } = await supabase
    .from('expense_patterns')
    .select('*') as { data: ExpensePattern[] | null };

  // Default categorization rules
  const defaultPatterns: CategoryPattern[] = [
    { pattern: 'salary|payroll|wage', category: 'Revenue', confidence: 0.9, isExpense: false },
    { pattern: 'sale|income|revenue', category: 'Revenue', confidence: 0.8, isExpense: false },
    { pattern: 'rent|lease', category: 'Rent', confidence: 0.9, isExpense: true },
    { pattern: 'utility|electric|water|gas', category: 'Utilities', confidence: 0.9, isExpense: true },
    { pattern: 'office|supplies', category: 'Office Supplies', confidence: 0.8, isExpense: true },
    { pattern: 'marketing|advertising', category: 'Marketing', confidence: 0.8, isExpense: true },
    { pattern: 'travel|hotel|flight', category: 'Travel', confidence: 0.8, isExpense: true },
    { pattern: 'insurance|coverage', category: 'Insurance', confidence: 0.9, isExpense: true },
  ];

  const allPatterns = [...(patterns || []).map(p => ({
    pattern: p.pattern,
    category: p.category,
    confidence: p.confidence || 0.5,
    isExpense: p.is_expense || false
  })), ...defaultPatterns];
  
  const descLower = description.toLowerCase();

  for (const pattern of allPatterns) {
    const regex = new RegExp(pattern.pattern, 'i');
    if (regex.test(descLower)) {
      return {
        category: pattern.category,
        confidence: pattern.confidence,
        isExpense: pattern.isExpense
      };
    }
  }

  // Default categorization based on amount
  return {
    category: amount < 0 ? 'Uncategorized Expense' : 'Uncategorized Revenue',
    confidence: 0.5,
    isExpense: amount < 0
  };
};

export const learnFromTransaction = async (
  description: string,
  category: string,
  isExpense: boolean,
  userId: string
) => {
  const keywords = description.toLowerCase().split(' ');
  const significantWords = keywords.filter(word => word.length > 3);
  
  // Create or update pattern
  const pattern = significantWords.join('|');
  const { error } = await supabase
    .from('expense_patterns')
    .upsert({
      user_id: userId,
      pattern,
      category,
      is_expense: isExpense,
      confidence: 0.7, // Initial confidence for user-defined patterns
    }) as { error: Error | null };

  if (error) console.error('Error learning pattern:', error);
};