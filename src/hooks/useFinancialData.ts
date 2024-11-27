import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  averageRevenue: number;
  averageExpense: number;
  profitMargin: number;
  cashBalance: number;
}

export const useFinancialData = (dateRange?: { from: Date | null; to: Date | null }) => {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['financial-data', session?.user.id, dateRange],
    queryFn: async () => {
      let revenueQuery = supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id);

      let expensesQuery = supabase
        .from('write_offs')
        .select('*')
        .eq('user_id', session?.user.id);

      let cashQuery = supabase
        .from('balance_sheet_items')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('category', 'asset')
        .eq('subcategory', 'cash');

      // Sync bank balances before getting cash items
      await supabase.functions.invoke('plaid-integration', {
        body: { 
          userId: session?.user.id,
          action: 'sync-balances'
        }
      });

      const [{ data: revenues = [], error: revenueError }, 
             { data: expenses = [], error: expenseError },
             { data: cashItems = [], error: cashError }] = 
        await Promise.all([revenueQuery, expensesQuery, cashQuery]);

      if (revenueError) throw revenueError;
      if (expenseError) throw expenseError;
      if (cashError) throw cashError;

      const totalRevenue = revenues.reduce((sum, record) => sum + Number(record.amount), 0);
      const totalExpenses = expenses.reduce((sum, record) => sum + Number(record.amount), 0);
      const netIncome = totalRevenue - totalExpenses;
      const averageRevenue = revenues.length ? totalRevenue / revenues.length : 0;
      const averageExpense = expenses.length ? totalExpenses / expenses.length : 0;
      const profitMargin = totalRevenue ? (netIncome / totalRevenue) * 100 : 0;
      const cashBalance = cashItems.reduce((sum, item) => sum + Number(item.amount), 0);

      return {
        totalRevenue,
        totalExpenses,
        netIncome,
        averageRevenue,
        averageExpense,
        profitMargin,
        cashBalance,
        revenues,
        expenses
      };
    },
    enabled: !!session?.user.id
  });
};
