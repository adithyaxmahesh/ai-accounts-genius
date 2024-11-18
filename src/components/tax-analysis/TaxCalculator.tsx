import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { TaxSummary } from "./TaxSummary";
import { TaxBreakdown } from "./TaxBreakdown";

export const TaxCalculator = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: analysis, refetch } = useQuery({
    queryKey: ['tax-analysis', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    }
  });

  const calculateTaxes = async () => {
    try {
      toast({
        title: "Calculating Taxes",
        description: "Analyzing your financial data...",
      });

      const { error } = await supabase.functions.invoke('calculate-taxes', {
        body: { 
          userId: session?.user.id 
        }
      });

      if (error) throw error;

      await refetch();

      toast({
        title: "Tax Analysis Complete",
        description: "Your tax calculation has been updated",
      });
    } catch (error) {
      console.error("Error calculating taxes:", error);
      toast({
        title: "Error",
        description: "Failed to calculate taxes. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Tax Calculator</h2>
        </div>
        <Button onClick={calculateTaxes} className="hover-scale">
          <ArrowRight className="mr-2 h-4 w-4" />
          Calculate Taxes
        </Button>
      </div>

      {analysis ? (
        <div className="space-y-6">
          <TaxSummary analysis={analysis} />
          <TaxBreakdown analysis={analysis} />
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Click the button above to calculate your estimated taxes
        </div>
      )}
    </Card>
  );
};