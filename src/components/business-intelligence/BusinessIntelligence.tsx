import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const BusinessIntelligence = () => {
  const { session } = useAuth();
  const { toast } = useToast();

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

      // Calculate monthly metrics
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
  const profitMargin = totalRevenue ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Business Intelligence</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-muted rounded-lg">
          <DollarSign className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <ArrowDownRight className="h-5 w-5 text-red-500 mb-2" />
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className="text-2xl font-bold">${totalProfit.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            Margin: {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financialData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Bar dataKey="revenue" name="Revenue" fill="#22c55e" />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
            <Bar dataKey="profit" name="Profit" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-6">
        {insights?.map((insight) => (
          <div key={insight.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-medium">{insight.category}</span>
              </div>
              <span className={`text-sm font-medium ${
                insight.priority === 'high' ? 'text-red-500' : 
                insight.priority === 'medium' ? 'text-yellow-500' : 
                'text-green-500'
              }`}>
                {insight.priority?.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2">
              {insight.recommendations?.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  {rec.includes('increase') || rec.includes('growth') ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mt-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mt-1" />
                  )}
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};