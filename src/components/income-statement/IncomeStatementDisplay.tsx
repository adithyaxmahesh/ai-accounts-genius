import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export const IncomeStatementDisplay = () => {
  const { toast } = useToast();

  const { data: statements = [], isLoading } = useQuery({
    queryKey: ['income-statements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_statements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching income statements",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const revenues = statements.filter(s => s.type === 'revenue');
  const expenses = statements.filter(s => s.type === 'expense');
  const totalRevenue = revenues.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = expenses.reduce((sum, s) => sum + s.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Income Statement</h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-4">Revenues</h3>
          {revenues.map(item => (
            <div key={item.id} className="flex justify-between items-center p-2 hover:bg-muted rounded">
              <span>{item.name}</span>
              <span className="text-green-600">${item.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center p-2 font-bold border-t mt-2">
            <span>Total Revenue</span>
            <span className="text-green-600">${totalRevenue.toFixed(2)}</span>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Expenses</h3>
          {expenses.map(item => (
            <div key={item.id} className="flex justify-between items-center p-2 hover:bg-muted rounded">
              <span>{item.name}</span>
              <span className="text-red-600">${item.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center p-2 font-bold border-t mt-2">
            <span>Total Expenses</span>
            <span className="text-red-600">${totalExpenses.toFixed(2)}</span>
          </div>
        </section>

        <div className="flex justify-between items-center p-4 bg-muted rounded-lg font-bold text-lg">
          <span>Net Income</span>
          <span className={netIncome >= 0 ? "text-green-600" : "text-red-600"}>
            ${netIncome.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
};