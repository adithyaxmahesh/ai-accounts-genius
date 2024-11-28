import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export interface FinancialStream {
  id: string;
  type: 'revenue' | 'expense' | 'write_off';
  amount: number;
  category: string;
  description: string;
  date: string;
  source?: string;
}

export const useFinancialStreams = () => {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['financial-streams', session?.user.id],
    queryFn: async () => {
      // Fetch revenue records
      const { data: revenueData, error: revenueError } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id);

      if (revenueError) throw revenueError;

      // Fetch write-offs
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
        .eq('user_id', session?.user.id);

      if (writeOffsError) throw writeOffsError;

      // Fetch income statements for expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('income_statements')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('type', 'expense');

      if (expensesError) throw expensesError;

      // Transform and combine all streams
      const streams: FinancialStream[] = [
        ...(revenueData?.map(revenue => ({
          id: revenue.id,
          type: 'revenue' as const,
          amount: revenue.amount,
          category: revenue.category,
          description: revenue.description,
          date: revenue.date,
          source: 'revenue_records'
        })) || []),
        ...(writeOffs?.map(writeOff => ({
          id: writeOff.id,
          type: 'write_off' as const,
          amount: writeOff.amount,
          category: writeOff.tax_codes?.expense_category || 'Uncategorized',
          description: writeOff.description,
          date: writeOff.date,
          source: 'write_offs'
        })) || []),
        ...(expenses?.map(expense => ({
          id: expense.id,
          type: 'expense' as const,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          source: 'income_statements'
        })) || [])
      ];

      return streams;
    },
    enabled: !!session?.user.id
  });
};