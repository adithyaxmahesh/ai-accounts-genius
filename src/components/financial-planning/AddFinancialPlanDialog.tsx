import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Plus } from "lucide-react";

const BUSINESS_EXPENSE_CATEGORIES = [
  { category: "Payroll", defaultAmount: "" },
  { category: "Rent & Utilities", defaultAmount: "" },
  { category: "Equipment & Supplies", defaultAmount: "" },
  { category: "Marketing & Advertising", defaultAmount: "" },
  { category: "Insurance", defaultAmount: "" },
  { category: "Professional Services", defaultAmount: "" },
  { category: "Software & Subscriptions", defaultAmount: "" },
  { category: "Travel & Entertainment", defaultAmount: "" },
  { category: "Inventory", defaultAmount: "" },
  { category: "Taxes", defaultAmount: "" },
  { category: "Maintenance & Repairs", defaultAmount: "" },
  { category: "Other Operating Expenses", defaultAmount: "" },
];

export const AddFinancialPlanDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [planType, setPlanType] = useState("");
  const [projectedRevenue, setProjectedRevenue] = useState("");
  const [expenses, setExpenses] = useState(BUSINESS_EXPENSE_CATEGORIES);
  const { session } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.defaultAmount) || 0), 0);
      const monthlyRevenue = Number(projectedRevenue) || 0;
      const netProfit = monthlyRevenue - totalExpenses;
      const profitMargin = monthlyRevenue ? (netProfit / monthlyRevenue) * 100 : 0;

      const planData = {
        projected_revenue: monthlyRevenue,
        expenses: expenses.map(exp => ({
          category: exp.category,
          amount: Number(exp.defaultAmount) || 0,
        })),
        total_expenses: totalExpenses,
        net_profit: netProfit,
        profit_margin: profitMargin,
        metrics: {
          expense_breakdown: expenses.reduce((acc, exp) => {
            acc[exp.category] = Number(exp.defaultAmount) || 0;
            return acc;
          }, {} as Record<string, number>),
          key_ratios: {
            profit_margin: profitMargin,
            expense_to_revenue: totalExpenses / monthlyRevenue * 100,
          }
        }
      };

      const { error } = await supabase
        .from('financial_planning')
        .insert({
          user_id: session?.user.id,
          plan_type: planType,
          plan_data: planData,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business budget plan created successfully",
      });

      setOpen(false);
      setProjectedRevenue("");
      setExpenses(BUSINESS_EXPENSE_CATEGORIES);
      setPlanType("");
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create budget plan",
        variant: "destructive",
      });
    }
  };

  const handleExpenseChange = (index: number, amount: string) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], defaultAmount: amount };
    setExpenses(newExpenses);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Business Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Business Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Budget Period</label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Budget</SelectItem>
                <SelectItem value="quarterly">Quarterly Budget</SelectItem>
                <SelectItem value="annual">Annual Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Projected Revenue ($)</label>
            <Input
              type="number"
              value={projectedRevenue}
              onChange={(e) => setProjectedRevenue(e.target.value)}
              placeholder="Enter projected revenue"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Business Expenses ($)</label>
            {expenses.map((expense, index) => (
              <div key={expense.category} className="flex items-center gap-2">
                <span className="w-48 text-sm">{expense.category}</span>
                <Input
                  type="number"
                  value={expense.defaultAmount}
                  onChange={(e) => handleExpenseChange(index, e.target.value)}
                  placeholder={`${expense.category} budget`}
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">Create Business Budget</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};