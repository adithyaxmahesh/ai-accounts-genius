import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface BusinessInsight {
  id: string;
  category: string;
  metrics: {
    revenue: number;
    expenses: number;
    profit_margin?: number;
  };
  recommendations: string[] | null;
  priority: string | null;
  created_at: string;
  user_id: string | null;
}

export const BusinessIntelligence = () => {
  const { session } = useAuth();

  const { data: insights } = useQuery<BusinessInsight[]>({
    queryKey: ['business-insights', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const calculateMetrics = (insight: BusinessInsight) => {
    const revenue = insight.metrics.revenue || 0;
    const expenses = insight.metrics.expenses || 0;
    const profitMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
    return { revenue, expenses, profitMargin };
  };

  return (
    <div>
      {insights?.map((insight) => {
        const { revenue, expenses, profitMargin } = calculateMetrics(insight);
        return (
          <Card key={insight.id} className="mb-4">
            <h3 className="text-lg font-semibold">{insight.category}</h3>
            <p>Revenue: ${revenue.toLocaleString()}</p>
            <p>Expenses: ${expenses.toLocaleString()}</p>
            <p>Profit Margin: {profitMargin.toFixed(2)}%</p>
            <p>Recommendations: {insight.recommendations?.join(", ")}</p>
            <p>Priority: {insight.priority}</p>
            <p>Created At: {new Date(insight.created_at).toLocaleDateString()}</p>
          </Card>
        );
      })}
    </div>
  );
};
