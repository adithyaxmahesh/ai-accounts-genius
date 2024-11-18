export type ExpensePattern = {
  id: string;
  user_id: string | null;
  pattern: string;
  category: string;
  confidence: number | null;
  is_expense: boolean | null;
  created_at: string;
  updated_at: string;
}

export type ExpensePatternsResponse = {
  data: ExpensePattern[] | null;
  error: Error | null;
}