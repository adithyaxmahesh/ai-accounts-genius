import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface TaxInsight {
  id: string;
  title: string;
  description: string;
  impact: number;
  category: string;
  created_at: string;
}

export const TaxInsightsCard = () => {
  const { session } = useAuth();

  const { data: insights } = useQuery<TaxInsight[]>({
    queryKey: ['tax-insights', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      {insights?.map((insight) => (
        <Card key={insight.id} className="p-4">
          <h4 className="font-semibold">{insight.title}</h4>
          <p>{insight.description}</p>
          <p className="text-sm text-muted-foreground">Impact: {insight.impact}</p>
          <p className="text-sm text-muted-foreground">Category: {insight.category}</p>
          <p className="text-sm text-muted-foreground">Created At: {new Date(insight.created_at).toLocaleDateString()}</p>
        </Card>
      ))}
    </div>
  );
};
