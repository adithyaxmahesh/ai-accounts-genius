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

      if (dateRange?.from) {
        revenueQuery = revenueQuery.gte('date', dateRange.from.toISOString().split('T')[0]);
        expensesQuery = expensesQuery.gte('date', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        revenueQuery = revenueQuery.lte('date', dateRange.to.toISOString().split('T')[0]);
        expensesQuery = expensesQuery.lte('date', dateRange.to.toISOString().split('T')[0]);
      }

      const [{ data: revenues = [], error: revenueError }, { data: expenses = [], error: expenseError }] = 
        await Promise.all([revenueQuery, expensesQuery]);

      if (revenueError) throw revenueError;
      if (expenseError) throw expenseError;

      const totalRevenue = revenues.reduce((sum, record) => sum + Math.abs(Number(record.amount)), 0);
      const totalExpenses = expenses.reduce((sum, record) => sum + Math.abs(Number(record.amount)), 0);
      const netIncome = totalRevenue - totalExpenses;
      const averageRevenue = revenues.length ? totalRevenue / revenues.length : 0;
      const averageExpense = expenses.length ? totalExpenses / expenses.length : 0;
      const profitMargin = totalRevenue ? (netIncome / totalRevenue) * 100 : 0;

      console.log('Financial Data Calculated:', {
        totalRevenue,
        totalExpenses,
        netIncome,
        averageRevenue,
        averageExpense,
        profitMargin
      });

      return {
        totalRevenue,
        totalExpenses,
        netIncome,
        averageRevenue,
        averageExpense,
        profitMargin,
        revenues,
        expenses
      };
    },
    enabled: !!session?.user.id
  });
};