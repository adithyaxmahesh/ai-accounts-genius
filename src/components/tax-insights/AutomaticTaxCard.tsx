import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingDown } from "lucide-react";

interface AutomaticTaxCalculation {
  id: string;
  user_id: string | null;
  total_income: number;
  total_deductions: number;
  estimated_tax: number;
  potential_savings: number;
  recommendations: any[];
  created_at: string;
  updated_at: string;
}

export const AutomaticTaxCard = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  // Trigger tax calculation
  useEffect(() => {
    const calculateTaxes = async () => {
      if (!session?.user.id) return;

      try {
        await supabase.functions.invoke('calculate-automatic-taxes', {
          body: { user_id: session.user.id }
        });
      } catch (error) {
        console.error('Error calculating taxes:', error);
      }
    };

    calculateTaxes();
  }, [session?.user.id]);

  // Get latest tax calculation
  const { data: taxData, isLoading, error } = useQuery({
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
    },
    enabled: !!session?.user.id
  });

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load tax calculations. Please try again later.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (!taxData) {
    return null;
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">Automatic Tax Analysis</h3>
        <TrendingDown className="h-6 w-6 text-green-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Estimated Tax</p>
          <p className="text-2xl font-bold text-red-500">
            ${taxData.estimated_tax.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Potential Savings</p>
          <p className="text-2xl font-bold text-green-500">
            ${taxData.potential_savings.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Recommendations</h4>
        <div className="space-y-2">
          {(taxData.recommendations as any[]).map((rec: any, index: number) => (
            <div key={index} className="p-3 bg-muted rounded-lg">
              <p>{rec.message}</p>
              {rec.potentialSavings > 0 && (
                <p className="text-sm text-green-500 mt-1">
                  Potential savings: ${rec.potentialSavings.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};