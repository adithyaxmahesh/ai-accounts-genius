import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { BreakEvenChart } from "./BreakEvenChart";
import { Loader2 } from "lucide-react";

export const BreakEvenAnalysis = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCost, setVariableCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['break-even-analysis', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('break_even_analysis')
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

  const calculateBreakEven = useMutation({
    mutationFn: async () => {
      const fixedCostsNum = Number(fixedCosts);
      const variableCostNum = Number(variableCost);
      const sellingPriceNum = Number(sellingPrice);

      if (sellingPriceNum <= variableCostNum) {
        throw new Error("Selling price must be greater than variable cost per unit");
      }

      const breakEvenPoint = fixedCostsNum / (sellingPriceNum - variableCostNum);
      const marginOfSafety = ((sellingPriceNum - variableCostNum) / sellingPriceNum) * 100;

      const { error } = await supabase
        .from('break_even_analysis')
        .insert({
          user_id: session?.user.id,
          fixed_costs: fixedCostsNum,
          variable_cost_per_unit: variableCostNum,
          selling_price_per_unit: sellingPriceNum,
          break_even_point: breakEvenPoint,
          margin_of_safety: marginOfSafety
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['break-even-analysis'] });
      toast({
        title: "Break-even analysis updated",
        description: "Your break-even analysis has been calculated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Break-Even Analysis</h2>
      
      <div className="grid gap-6 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Fixed Costs ($)</label>
          <Input
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(e.target.value)}
            placeholder="Enter total fixed costs"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Variable Cost per Unit ($)</label>
          <Input
            type="number"
            value={variableCost}
            onChange={(e) => setVariableCost(e.target.value)}
            placeholder="Enter variable cost per unit"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Selling Price per Unit ($)</label>
          <Input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="Enter selling price per unit"
          />
        </div>

        <Button 
          onClick={() => calculateBreakEven.mutate()}
          disabled={!fixedCosts || !variableCost || !sellingPrice || calculateBreakEven.isPending}
        >
          {calculateBreakEven.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'Calculate Break-Even Point'
          )}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium mb-2">Break-Even Point</h3>
              <p className="text-2xl font-bold">
                {Math.round(analysis.break_even_point).toLocaleString()} units
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-sm font-medium mb-2">Margin of Safety</h3>
              <p className="text-2xl font-bold">
                {analysis.margin_of_safety.toFixed(1)}%
              </p>
            </div>
          </div>

          <BreakEvenChart analysis={analysis} />
        </div>
      )}
    </Card>
  );
};