import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { AutomaticTaxCalculation } from "@/integrations/supabase/types/tax";

export const AutomaticTaxCard = () => {
  const { session } = useAuth();

  const { data: taxCalculation } = useQuery<AutomaticTaxCalculation>({
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
      return data;
    },
    enabled: !!session?.user.id
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <DollarSign className="h-5 w-5 text-primary mb-2" />
        <h3 className="text-sm font-medium">Estimated Tax Due</h3>
        <p className="text-2xl font-bold">${taxCalculation?.estimated_tax?.toLocaleString() ?? 0}</p>
      </Card>

      <Card className="p-4">
        <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
        <h3 className="text-sm font-medium">Deductions Found</h3>
        <p className="text-2xl font-bold">
          ${taxCalculation?.total_deductions?.toLocaleString() ?? 0}
        </p>
      </Card>

      <Card className="p-4">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mb-2" />
        <h3 className="text-sm font-medium">Missing Documentation</h3>
        <p className="text-2xl font-bold">
          {taxCalculation?.recommendations?.missing_docs?.length ?? 0}
        </p>
      </Card>
    </div>
  );
};