import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface AutomaticTaxCalculation {
  id: string;
  user_id: string | null;
  total_income: number;
  total_deductions: number;
  estimated_tax: number;
  potential_savings: number;
  recommendations: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export const TaxInsightsCard = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: taxCalculations } = useQuery<AutomaticTaxCalculation>({
    queryKey: ['automatic-tax-calculations', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automatic_tax_calculations')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id
  });

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
            ${taxCalculations?.estimated_tax?.toLocaleString() ?? '0'}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Potential Tax Savings</p>
          <p className="text-2xl font-bold text-green-600">
            ${taxCalculations?.potential_savings?.toLocaleString() ?? '0'}
          </p>
        </div>

        {taxCalculations?.recommendations && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Recommendations</p>
            <ul className="space-y-2">
              {Object.entries(taxCalculations.recommendations).map(([key, value]) => (
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