import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export const IncomeStatementDisplay = () => {
  const { toast } = useToast();
  const { session } = useAuth();

  // Add sample data if none exists
  useEffect(() => {
    const addSampleData = async () => {
      const { data: existingData } = await supabase
        .from('income_statements')
        .select('id')
        .limit(1);

      if (!existingData?.length && session?.user.id) {
        const sampleData = [
          {
            user_id: session.user.id,
            category: 'sales_revenue',
            name: 'Product Sales',
            amount: 150000,
            type: 'revenue',
            description: 'Revenue from product sales'
          },
          {
            user_id: session.user.id,
            category: 'service_revenue',
            name: 'Consulting Services',
            amount: 75000,
            type: 'revenue',
            description: 'Revenue from consulting services'
          },
          {
            user_id: session.user.id,
            category: 'cost_of_goods_sold',
            name: 'Cost of Goods Sold',
            amount: 60000,
            type: 'expense',
            description: 'Direct costs of products sold'
          },
          {
            user_id: session.user.id,
            category: 'operating_expense',
            name: 'Salaries',
            amount: 45000,
            type: 'expense',
            description: 'Employee salaries and wages'
          },
          {
            user_id: session.user.id,
            category: 'operating_expense',
            name: 'Rent',
            amount: 12000,
            type: 'expense',
            description: 'Office rent'
          },
          {
            user_id: session.user.id,
            category: 'operating_expense',
            name: 'Utilities',
            amount: 5000,
            type: 'expense',
            description: 'Electricity and water'
          }
        ];

        const { error } = await supabase
          .from('income_statements')
          .insert(sampleData);

        if (error) {
          console.error('Error adding sample data:', error);
        }
      }
    };

    addSampleData();
  }, [session?.user.id]);

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
    <Card className="p-6 bg-background">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Income Statement</h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-4 text-foreground">Revenues</h3>
          {revenues.map(item => (
            <div key={item.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded transition-colors">
              <div>
                <span className="text-foreground">{item.name}</span>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <span className="text-green-500">${item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between items-center p-2 font-bold border-t border-border mt-2">
            <span className="text-foreground">Total Revenue</span>
            <span className="text-green-500">${totalRevenue.toLocaleString()}</span>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 text-foreground">Expenses</h3>
          {expenses.map(item => (
            <div key={item.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded transition-colors">
              <div>
                <span className="text-foreground">{item.name}</span>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <span className="text-red-500">${item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between items-center p-2 font-bold border-t border-border mt-2">
            <span className="text-foreground">Total Expenses</span>
            <span className="text-red-500">${totalExpenses.toLocaleString()}</span>
          </div>
        </section>

        <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg font-bold text-lg">
          <span className="text-foreground">Net Income</span>
          <span className={netIncome >= 0 ? "text-green-500" : "text-red-500"}>
            ${netIncome.toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
};