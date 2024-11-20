import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type AutomaticTaxCalculation = Tables<'automatic_tax_calculations'>;

export function AutomaticTaxCard() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [taxData, setTaxData] = useState<AutomaticTaxCalculation | null>(null);

  useEffect(() => {
    if (session?.user.id) {
      fetchTaxData();
    }
  }, [session?.user.id]);

  const fetchTaxData = async () => {
    try {
      const { data, error } = await supabase
        .from('automatic_tax_calculations')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setTaxData(data);
      }
    } catch (error) {
      console.error('Error fetching tax data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tax calculations",
        variant: "destructive",
      });
    }
  };

  if (!taxData) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automatic Tax Calculations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Total Income</p>
          <p className="text-2xl font-bold">${taxData.total_income.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Total Deductions</p>
          <p className="text-2xl font-bold">${taxData.total_deductions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Estimated Tax</p>
          <p className="text-2xl font-bold">${taxData.estimated_tax.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Potential Savings</p>
          <p className="text-2xl font-bold text-green-600">${taxData.potential_savings.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}