import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ClipboardList, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { AddFinancialPlanDialog } from "./AddFinancialPlanDialog";
import { Progress } from "@/components/ui/progress";

interface BudgetPlan {
  id: string;
  plan_type: string;
  plan_data: {
    monthly_income: number;
    expenses: Array<{
      category: string;
      amount: number;
    }>;
    total_expenses: number;
    monthly_surplus: number;
  };
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
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data as BudgetPlan[];
    },
    enabled: !!session?.user.id
  });

  const activePlan = plans?.[0];
  const spendingPercentage = activePlan 
    ? (activePlan.plan_data.total_expenses / activePlan.plan_data.monthly_income) * 100 
    : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Budget Planning</h2>
      </div>

      <AddFinancialPlanDialog onSuccess={refetch} />

      {activePlan ? (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
              <h3 className="text-sm font-medium">Monthly Income</h3>
              <p className="text-2xl font-bold text-green-500">
                ${activePlan.plan_data.monthly_income.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-500 mb-2" />
              <h3 className="text-sm font-medium">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-500">
                ${activePlan.plan_data.total_expenses.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Usage</span>
              <span>{spendingPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={spendingPercentage} className="h-2" />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Expense Breakdown</h3>
            {activePlan.plan_data.expenses.map((expense) => (
              expense.amount > 0 && (
                <div key={expense.category} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>{expense.category}</span>
                  <span className="font-medium">${expense.amount.toLocaleString()}</span>
                </div>
              )
            ))}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Monthly Surplus/Deficit</h3>
            <p className={`text-xl font-bold ${
              activePlan.plan_data.monthly_surplus >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              ${activePlan.plan_data.monthly_surplus.toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground mt-4">No active budget plan. Create one to get started!</p>
      )}
    </Card>
  );
};