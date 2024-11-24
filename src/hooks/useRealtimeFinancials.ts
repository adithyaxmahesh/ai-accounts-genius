import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { subHours } from 'date-fns';

interface FinancialData {
  revenue: number;
  expenses: number;
  netIncome: number;
  growthRate: number;
  chartData: Array<{
    date: string;
    revenue: number;
    expenses: number;
  }>;
}

export const useRealtimeFinancials = () => {
  const { session } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData>({
    revenue: 0,
    expenses: 0,
    netIncome: 0,
    growthRate: 0,
    chartData: []
  });

  const fetchData = async () => {
    if (!session?.user.id) return;

    const last24Hours = subHours(new Date(), 24).toISOString();

    const [revenueResponse, expensesResponse] = await Promise.all([
      supabase
        .from('revenue_records')
        .select('amount, date')
        .eq('user_id', session.user.id)
        .gte('date', last24Hours)
        .order('date', { ascending: true }),
      
      supabase
        .from('write_offs')
        .select('amount, date')
        .eq('user_id', session.user.id)
        .gte('date', last24Hours)
        .order('date', { ascending: true })
    ]);

    const revenue = revenueResponse.data?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
    const expenses = expensesResponse.data?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
    const netIncome = revenue - expenses;
    
    // Calculate growth rate compared to previous 24 hours
    const previousPeriod = subHours(new Date(), 48).toISOString();
    const [prevRevenueResponse] = await Promise.all([
      supabase
        .from('revenue_records')
        .select('amount')
        .eq('user_id', session.user.id)
        .gte('date', previousPeriod)
        .lt('date', last24Hours)
    ]);

    const prevRevenue = prevRevenueResponse.data?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
    const growthRate = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Prepare chart data
    const chartData = revenueResponse.data?.map(rev => ({
      date: new Date(rev.date).toLocaleString('default', { hour: 'numeric' }),
      revenue: Number(rev.amount),
      expenses: expensesResponse.data?.find(exp => exp.date === rev.date)?.amount || 0
    })) || [];

    setFinancialData({
      revenue,
      expenses,
      netIncome,
      growthRate,
      chartData
    });
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time changes
    const revenueChannel = supabase
      .channel('revenue-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'revenue_records' },
        () => fetchData()
      )
      .subscribe();

    const expensesChannel = supabase
      .channel('expense-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'write_offs' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      revenueChannel.unsubscribe();
      expensesChannel.unsubscribe();
    };
  }, [session?.user.id]);

  return financialData;
};