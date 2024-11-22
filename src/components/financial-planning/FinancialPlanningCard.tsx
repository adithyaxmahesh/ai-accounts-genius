import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ClipboardList, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { AddFinancialPlanDialog } from "./AddFinancialPlanDialog";
import { Progress } from "@/components/ui/progress";

interface BudgetPlan {
  id: string;
  plan_type: string;
  plan_data: {
    projected_revenue: number;
    expenses: Array<{
      category: string;
      amount: number;
    }>;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
    metrics: {
      expense_breakdown: Record<string, number>;
      key_ratios: {
        profit_margin: number;
        expense_to_revenue: number;
      };
    };
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
  const expenseToRevenueRatio = activePlan 
    ? (activePlan.plan_data.total_expenses / activePlan.plan_data.projected_revenue) * 100 
    : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Business Budget Planning</h2>
      </div>

      <AddFinancialPlanDialog onSuccess={refetch} />

      {activePlan ? (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <DollarSign className="h-5 w-5 text-green-500 mb-2" />
              <h3 className="text-sm font-medium">Projected Revenue</h3>
              <p className="text-2xl font-bold text-green-500">
                ${activePlan.plan_data.projected_revenue.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-500 mb-2" />
              <h3 className="text-sm font-medium">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-500">
                ${activePlan.plan_data.total_expenses.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
              <h3 className="text-sm font-medium">Net Profit</h3>
              <p className="text-2xl font-bold text-blue-500">
                ${activePlan.plan_data.net_profit.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-500 mb-2" />
              <h3 className="text-sm font-medium">Profit Margin</h3>
              <p className="text-2xl font-bold text-purple-500">
                {activePlan.plan_data.profit_margin.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Usage</span>
              <span>{expenseToRevenueRatio.toFixed(1)}% of Revenue</span>
            </div>
            <Progress value={expenseToRevenueRatio} className="h-2" />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Expense Breakdown</h3>
            {activePlan.plan_data.expenses.map((expense) => (
              expense.amount > 0 && (
                <div key={expense.category} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>{expense.category}</span>
                  <div className="text-right">
                    <span className="font-medium">${expense.amount.toLocaleString()}</span>
                    <p className="text-xs text-muted-foreground">
                      {((expense.amount / activePlan.plan_data.projected_revenue) * 100).toFixed(1)}% of revenue
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Budget Period</h3>
            <p className="text-lg capitalize">
              {activePlan.plan_type} Budget
            </p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground mt-4">No active budget plan. Create one to get started!</p>
      )}
    </Card>
  );
};