import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface IncomeStatementItem {
  id: string;
  category: string;
  name: string;
  amount: number;
  type: string;
  description: string | null;
  date: string;
}

const IncomeStatement = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: statements = [], isLoading } = useQuery({
    queryKey: ['income-statements', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_statements')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id,
  });

  const calculateTotals = (items: IncomeStatementItem[]) => {
    const revenues = items.filter(item => item.type === 'revenue')
      .reduce((sum, item) => sum + item.amount, 0);
    const expenses = items.filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    const netIncome = revenues - expenses;
    return { revenues, expenses, netIncome };
  };

  const categorizeOperations = (items: IncomeStatementItem[]) => {
    const operating = items.filter(item => 
      ['sales', 'service_revenue', 'cost_of_goods_sold', 'operating_expense'].includes(item.category));
    const nonOperating = items.filter(item => 
      ['interest_income', 'interest_expense', 'other_income', 'other_expense'].includes(item.category));
    return { operating, nonOperating };
  };

  const { revenues, expenses, netIncome } = calculateTotals(statements);

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Income Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single-step" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single-step">Single-Step Format</TabsTrigger>
              <TabsTrigger value="multi-step">Multi-Step Format</TabsTrigger>
            </TabsList>

            <TabsContent value="single-step">
              {isLoading ? (
                <p>Loading...</p>
              ) : statements.length > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Revenues</h3>
                    {statements
                      .filter(item => item.type === 'revenue')
                      .map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{item.name}</span>
                          <span className="text-green-600">${item.amount.toFixed(2)}</span>
                        </div>
                      ))
                    }
                    <div className="flex justify-between items-center p-2 font-semibold">
                      <span>Total Revenues</span>
                      <span className="text-green-600">${revenues.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Expenses</h3>
                    {statements
                      .filter(item => item.type === 'expense')
                      .map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{item.name}</span>
                          <span className="text-red-600">${item.amount.toFixed(2)}</span>
                        </div>
                      ))
                    }
                    <div className="flex justify-between items-center p-2 font-semibold">
                      <span>Total Expenses</span>
                      <span className="text-red-600">${expenses.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className={cn(
                    "flex justify-between items-center p-4 rounded-lg font-bold text-lg",
                    netIncome >= 0 ? "bg-green-100" : "bg-red-100"
                  )}>
                    <span>Net Income</span>
                    <span className={netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                      ${netIncome.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p>No income statement data found.</p>
              )}
            </TabsContent>

            <TabsContent value="multi-step">
              {isLoading ? (
                <p>Loading...</p>
              ) : statements.length > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Operating Activities</h3>
                    {categorizeOperations(statements).operating.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>{item.name}</span>
                        <span className={item.type === 'revenue' ? "text-green-600" : "text-red-600"}>
                          ${item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Non-Operating Activities</h3>
                    {categorizeOperations(statements).nonOperating.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>{item.name}</span>
                        <span className={item.type === 'revenue' ? "text-green-600" : "text-red-600"}>
                          ${item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className={cn(
                    "flex justify-between items-center p-4 rounded-lg font-bold text-lg",
                    netIncome >= 0 ? "bg-green-100" : "bg-red-100"
                  )}>
                    <span>Net Income</span>
                    <span className={netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                      ${netIncome.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p>No income statement data found.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeStatement;