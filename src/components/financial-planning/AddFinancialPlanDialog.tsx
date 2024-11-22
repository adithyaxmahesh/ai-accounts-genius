import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Plus } from "lucide-react";

export const AddFinancialPlanDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [planType, setPlanType] = useState("");
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<{ category: string; amount: string }[]>([
    { category: "Housing", amount: "" },
    { category: "Transportation", amount: "" },
    { category: "Food", amount: "" },
    { category: "Utilities", amount: "" },
    { category: "Insurance", amount: "" },
    { category: "Healthcare", amount: "" },
    { category: "Savings", amount: "" },
    { category: "Entertainment", amount: "" },
    { category: "Other", amount: "" },
  ]);
  const { session } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      const monthlyIncome = Number(income) || 0;
      const surplus = monthlyIncome - totalExpenses;

      const planData = {
        monthly_income: monthlyIncome,
        expenses: expenses.map(exp => ({
          category: exp.category,
          amount: Number(exp.amount) || 0,
        })),
        total_expenses: totalExpenses,
        monthly_surplus: surplus,
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
        description: "Budget plan created successfully",
      });

      setOpen(false);
      setIncome("");
      setExpenses(expenses.map(exp => ({ ...exp, amount: "" })));
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
    newExpenses[index] = { ...newExpenses[index], amount };
    setExpenses(newExpenses);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Budget Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Budget Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Type</label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Budget</SelectItem>
                <SelectItem value="quarterly">Quarterly Budget</SelectItem>
                <SelectItem value="annual">Annual Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Monthly Income ($)</label>
            <Input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="Enter your monthly income"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Monthly Expenses ($)</label>
            {expenses.map((expense, index) => (
              <div key={expense.category} className="flex items-center gap-2">
                <span className="w-32 text-sm">{expense.category}</span>
                <Input
                  type="number"
                  value={expense.amount}
                  onChange={(e) => handleExpenseChange(index, e.target.value)}
                  placeholder={`${expense.category} expense`}
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">Create Budget Plan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};