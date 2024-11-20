import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { TrendingDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { AutomaticTaxCalculation } from "@/integrations/supabase/types/tax";

export const AutomaticTaxCard = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: taxData } = useQuery({
    queryKey: ['automatic-tax-calculation', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automatic_tax_calculations')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as AutomaticTaxCalculation;
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">Automatic Tax Calculations</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/tax')}>
          View Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold">
            ${taxData?.total_income?.toLocaleString() ?? 0}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Total Deductions</p>
          <p className="text-2xl font-bold text-green-600">
            ${taxData?.total_deductions?.toLocaleString() ?? 0}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Estimated Tax</p>
          <p className="text-2xl font-bold text-blue-600">
            ${taxData?.estimated_tax?.toLocaleString() ?? 0}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Potential Savings</p>
          <p className="text-2xl font-bold text-green-600">
            ${taxData?.potential_savings?.toLocaleString() ?? 0}
          </p>
        </div>

        {taxData?.recommendations && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Recommendations</p>
            <ul className="space-y-2">
              {Object.entries(taxData.recommendations).map(([key, value]) => (
                <li key={key} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{value as string}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};