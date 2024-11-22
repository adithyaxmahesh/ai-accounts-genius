import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LineChart, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from "react";
import { MetricsDisplay } from "./MetricsDisplay";
import { InsightsDisplay } from "./InsightsDisplay";
import { subYears, startOfQuarter, endOfQuarter } from "date-fns";

interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
  month: string;
}

interface Transaction {
  date: string;
  description: string;
  amount: number;
  isExpense?: boolean;
}

const categorizeTransaction = async (description: string, amount: number) => {
  return {
    isExpense: amount < 0,
  };
};

export const BusinessIntelligence = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("total");

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "1year":
        return {
          start: subYears(now, 1),
          end: now
        };
      case "q1":
        return {
          start: startOfQuarter(new Date(now.getFullYear(), 0, 1)),
          end: endOfQuarter(new Date(now.getFullYear(), 0, 1))
        };
      case "q2":
        return {
          start: startOfQuarter(new Date(now.getFullYear(), 3, 1)),
          end: endOfQuarter(new Date(now.getFullYear(), 3, 1))
        };
      case "q3":
        return {
          start: startOfQuarter(new Date(now.getFullYear(), 6, 1)),
          end: endOfQuarter(new Date(now.getFullYear(), 6, 1))
        };
      case "q4":
        return {
          start: startOfQuarter(new Date(now.getFullYear(), 9, 1)),
          end: endOfQuarter(new Date(now.getFullYear(), 9, 1))
        };
      default:
        return {
          start: null,
          end: null
        };
    }
  };

  const { data: financialData } = useQuery<FinancialData[]>({
    queryKey: ['financial-metrics', session?.user.id, timeRange],
    queryFn: async () => {
      const dateRange = getDateRange();
      let revenueQuery = supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id);

      let expensesQuery = supabase
        .from('write_offs')
        .select('*')
        .eq('user_id', session?.user.id);

      if (dateRange.start && dateRange.end) {
        revenueQuery = revenueQuery
          .gte('date', dateRange.start.toISOString())
          .lte('date', dateRange.end.toISOString());
        
        expensesQuery = expensesQuery
          .gte('date', dateRange.start.toISOString())
          .lte('date', dateRange.end.toISOString());
      }

      const [{ data: transactions }, { data: expenses }] = await Promise.all([
        revenueQuery,
        expensesQuery
      ]);

      const categorizedTransactions = await Promise.all([
        ...(transactions || []).map(async t => ({
          ...t,
          ...(await categorizeTransaction(t.description, t.amount))
        })),
        ...(expenses || []).map(async e => ({
          ...e,
          ...(await categorizeTransaction(e.description, -e.amount))
        }))
      ]);

      const monthlyData = categorizedTransactions.reduce((acc, curr) => {
        const date = new Date(curr.date);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const key = `${month} ${year}`;

        if (!acc[key]) {
          acc[key] = { revenue: 0, expenses: 0, profit: 0, month: key };
        }

        if (curr.isExpense) {
          acc[key].expenses += Math.abs(Number(curr.amount));
        } else {
          acc[key].revenue += Number(curr.amount);
        }
        acc[key].profit = acc[key].revenue - acc[key].expenses;

        return acc;
      }, {} as Record<string, FinancialData>);

      return Object.values(monthlyData);
    }
  });

  const { data: insights, refetch } = useQuery({
    queryKey: ['business-insights', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data;
    }
  });

  const generateInsights = async () => {
    try {
      toast({
        title: "Generating Insights",
        description: "Analyzing your business data...",
      });

      const { error } = await supabase.functions.invoke('generate-insights', {
        body: { 
          userId: session?.user.id 
        }
      });

      if (error) throw error;
      await refetch();

      toast({
        title: "Insights Generated",
        description: "New business insights are available",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalRevenue = (financialData || []).reduce((sum, month) => sum + month.revenue, 0);
  const totalExpenses = (financialData || []).reduce((sum, month) => sum + month.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Business Intelligence</h2>
        </div>
        <Button onClick={generateInsights} className="hover-scale">
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate New Insights
        </Button>
      </div>

      <div className="mb-4">
        <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value)}>
          <ToggleGroupItem value="total" aria-label="View all time data" className="text-xs">
            Total
          </ToggleGroupItem>
          <ToggleGroupItem value="1year" aria-label="View last year data" className="text-xs">
            1 Year
          </ToggleGroupItem>
          <ToggleGroupItem value="q1" aria-label="View Q1 data" className="text-xs">
            Q1
          </ToggleGroupItem>
          <ToggleGroupItem value="q2" aria-label="View Q2 data" className="text-xs">
            Q2
          </ToggleGroupItem>
          <ToggleGroupItem value="q3" aria-label="View Q3 data" className="text-xs">
            Q3
          </ToggleGroupItem>
          <ToggleGroupItem value="q4" aria-label="View Q4 data" className="text-xs">
            Q4
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <MetricsDisplay
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        totalProfit={totalProfit}
      />

      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financialData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="revenue" name="Revenue" fill="#22c55e" />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
            <Bar dataKey="profit" name="Profit" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <InsightsDisplay insights={insights} />
    </Card>
  );
};