import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TrendingDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface TaxAnalysis {
  tax_impact: number | null;
  recommendations: Record<string, string> | null;
}

export const TaxInsightsCard = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: taxAnalysis } = useQuery<TaxAnalysis>({
    queryKey: ['tax-analysis', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: writeOffs } = useQuery({
    queryKey: ['write-offs', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('write_offs')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('status', 'approved');
      
      if (error) throw error;
      return data;
    }
  });

  const potentialSavings = writeOffs?.reduce((sum, writeOff) => {
    return sum + (writeOff.amount * 0.25); // Estimated tax rate for calculation
  }, 0) || 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Tax Insights</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/tax')}>
          View Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Estimated Tax</p>
          <p className="text-2xl font-bold">
            ${taxAnalysis?.tax_impact?.toLocaleString() ?? 0}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Potential Tax Savings</p>
          <p className="text-2xl font-bold text-green-600">
            ${potentialSavings.toLocaleString()}
          </p>
        </div>

        {taxAnalysis?.recommendations && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Recommendations</p>
            <ul className="space-y-2">
              {Object.entries(taxAnalysis.recommendations).map(([key, value]) => (
                <li key={key} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
