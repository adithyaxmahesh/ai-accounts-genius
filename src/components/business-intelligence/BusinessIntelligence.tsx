import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { LineChart, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
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

  const { data: businessInsights } = useQuery({
    queryKey: ['business-insights', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <LineChart className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Business Intelligence</h2>
      </div>

      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financialData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" name="Revenue" fill="#22c55e" />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
            <Bar dataKey="profit" name="Profit" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {businessInsights?.map((insight) => (
          <div key={insight.id} className="p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{insight.category}</span>
            </div>
            {insight.recommendations?.slice(0, 1).map((rec, index) => (
              <div key={index} className="flex items-start gap-2 mt-1">
                {rec.includes('increase') || rec.includes('growth') ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mt-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mt-1" />
                )}
                <p className="text-xs text-muted-foreground">{rec}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};