import { supabase } from "@/integrations/supabase/client";
import { WriteOff } from "@/components/types";

interface RevenueRecord {
  amount: number;
  category: string;
  description: string;
  date: string;
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
      *,
      tax_codes (
        code,
        description,
        state,
        expense_category
      )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .returns<WriteOff[]>();

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