import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { SmartBudgetPlanner } from "./SmartBudgetPlanner";

export const FinancialPlanningCard = () => {
  const { session } = useAuth();

  const { data: plans } = useQuery({
    queryKey: ['financial-plans', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_planning')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Financial Planning</h2>
        </div>

        <SmartBudgetPlanner />

        {plans?.map((plan) => (
          <div key={plan.id} className="mt-6">
            <h3 className="font-semibold mb-2">Current Budget Plan</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(plan.plan_data, null, 2)}
            </pre>
          </div>
        ))}
      </Card>
    </div>
  );
};