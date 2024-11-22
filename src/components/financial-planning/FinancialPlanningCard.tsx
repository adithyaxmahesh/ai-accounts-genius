import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { AddFinancialPlanDialog } from "./AddFinancialPlanDialog";

interface FinancialPlan {
  id: string;
  plan_type: string;
  plan_data: any;
  status: string;
  created_at: string;
}

export const FinancialPlanningCard = () => {
  const { session } = useAuth();

  const { data: plans, refetch } = useQuery({
    queryKey: ['financial-plans', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_planning')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FinancialPlan[];
    },
    enabled: !!session?.user.id
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Financial Planning</h2>
      </div>

      <AddFinancialPlanDialog onSuccess={refetch} />

      <div className="space-y-4 mt-4">
        {(!plans || plans.length === 0) && (
          <p className="text-muted-foreground">No financial plans yet. Create one to get started!</p>
        )}
        
        {plans?.map((plan) => (
          <div key={plan.id} className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium capitalize">{plan.plan_type}</h3>
              <span className="text-sm px-2 py-1 bg-primary/10 rounded-full capitalize">
                {plan.status}
              </span>
            </div>
            {plan.plan_data && (
              <div className="text-sm text-muted-foreground">
                <pre className="whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(plan.plan_data, null, 2)}
                </pre>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Created: {new Date(plan.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};