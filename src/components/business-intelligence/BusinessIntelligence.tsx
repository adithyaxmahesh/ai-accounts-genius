import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { LineChart, TrendingUp, ArrowUpRight, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const BusinessIntelligence = () => {
  const { session } = useAuth();

  const { data: financialData } = useQuery({
    queryKey: ['financial-metrics', session?.user.id],
    queryFn: async () => {
      const { data: revenue } = await supabase
        .from('revenue_records')
        .select('amount, date')
        .eq('user_id', session?.user.id);

      const { data: expenses } = await supabase
        .from('write_offs')
        .select('amount, date')
        .eq('user_id', session?.user.id);

      const monthlyData = (revenue || []).concat((expenses || []).map(e => ({ 
        ...e, 
        amount: -e.amount 
      }))).reduce((acc, curr) => {
        const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { revenue: 0, expenses: 0 };
        }
        if (curr.amount > 0) {
          acc[month].revenue += curr.amount;
        } else {
          acc[month].expenses += Math.abs(curr.amount);
        }
        return acc;
      }, {} as Record<string, { revenue: number; expenses: number }>);

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses
      }));
    }
  });

  const totalRevenue = financialData?.reduce((sum, data) => sum + data.revenue, 0) || 0;
  const totalExpenses = financialData?.reduce((sum, data) => sum + data.expenses, 0) || 0;
  const totalProfit = totalRevenue - totalExpenses;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <LineChart className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Business Intelligence</h2>
      </div>

      <div className="p-4 bg-muted rounded-lg mb-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          <span className="font-medium">Financial Summary</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-lg font-bold">${totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profit</p>
            <p className="text-lg font-bold">${totalProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financialData?.slice(-6)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Bar dataKey="revenue" name="Revenue" fill="#22c55e" />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};