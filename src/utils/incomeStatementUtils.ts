import { supabase } from "@/integrations/supabase/client";

interface RevenueRecord {
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface WriteOff {
  amount: number;
  description: string;
  date: string;
  tax_codes?: {
    expense_category: string;
  } | null;
}

export const fetchAndTransformIncomeData = async (userId: string) => {
  // Fetch revenue records
  const { data: revenueRecords, error: revenueError } = await supabase
    .from('revenue_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (revenueError) throw revenueError;

  // Fetch write-offs (expenses)
  const { data: writeOffs, error: writeOffsError } = await supabase
    .from('write_offs')
    .select(`
      amount,
      description,
      date,
      tax_codes (
        expense_category
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (writeOffsError) throw writeOffsError;

  // Transform revenue records
  const revenueEntries = (revenueRecords || []).map((record: RevenueRecord) => ({
    id: crypto.randomUUID(),
    category: record.category,
    name: record.description,
    amount: record.amount,
    type: 'revenue',
    description: record.description,
    date: record.date
  }));

  // Transform write-offs into expense entries
  const expenseEntries = (writeOffs || []).map((writeOff: WriteOff) => ({
    id: crypto.randomUUID(),
    category: writeOff.tax_codes?.expense_category || 'uncategorized',
    name: writeOff.description,
    amount: writeOff.amount,
    type: 'expense',
    description: writeOff.description,
    date: writeOff.date
  }));

  return [...revenueEntries, ...expenseEntries];
};