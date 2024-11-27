import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AddIncomeStatementEntry } from "@/components/income-statement/AddIncomeStatementEntry";
import { Loader2, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { fetchAndTransformIncomeData } from "@/utils/incomeStatementUtils";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  useRealtimeSubscription('revenue_records', ['income-statements', session?.user.id]);
  useRealtimeSubscription('write_offs', ['income-statements', session?.user.id]);

  const { data: statements = [], isLoading } = useQuery({
    queryKey: ['income-statements', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];
      try {
        const data = await fetchAndTransformIncomeData(session.user.id);
        return data;
      } catch (error) {
        toast({
          title: "Error fetching income statement data",
          description: "There was an error loading your income statement. Please try again.",
          variant: "destructive"
        });
        return [];
      }
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

  const FinanceMetricCard = ({ label, value, type }: { label: string; value: number; type: 'revenue' | 'expense' | 'income' }) => {
    const isPositive = value >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    const getGradient = () => {
      switch (type) {
        case 'revenue':
          return 'from-green-500/20 to-green-500/5';
        case 'expense':
          return 'from-red-500/20 to-red-500/5';
        case 'income':
          return isPositive ? 'from-primary/20 to-primary/5' : 'from-destructive/20 to-destructive/5';
      }
    };

    const getTextColor = () => {
      switch (type) {
        case 'revenue':
          return 'text-green-500';
        case 'expense':
          return 'text-red-500';
        case 'income':
          return isPositive ? 'text-primary' : 'text-destructive';
      }
    };

    return (
      <div className={cn(
        "p-6 rounded-lg bg-gradient-to-br backdrop-blur-sm animate-fade-in",
        getGradient(),
        "border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300"
      )}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <Icon className={cn("h-5 w-5", getTextColor())} />
        </div>
        <p className={cn(
          "text-2xl font-bold tracking-tight",
          getTextColor()
        )}>
          ${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  };

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Income Statement</CardTitle>
          <AddIncomeStatementEntry />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single-step" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single-step">Single-Step Format</TabsTrigger>
              <TabsTrigger value="multi-step">Multi-Step Format</TabsTrigger>
            </TabsList>

            <TabsContent value="single-step">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : statements.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FinanceMetricCard
                      label="Total Revenues"
                      value={revenues}
                      type="revenue"
                    />
                    <FinanceMetricCard
                      label="Total Expenses"
                      value={-expenses}
                      type="expense"
                    />
                    <FinanceMetricCard
                      label="Net Income"
                      value={netIncome}
                      type="income"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Revenues</h3>
                    {statements
                      .filter(item => item.type === 'revenue')
                      .map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </div>
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
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                          <span className="text-red-600">${item.amount.toFixed(2)}</span>
                        </div>
                      ))
                    }
                    <div className="flex justify-between items-center p-2 font-semibold">
                      <span>Total Expenses</span>
                      <span className="text-red-600">${expenses.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No income statement data found.</p>
                  <p className="mt-2">Click "Add Entry" to get started.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="multi-step">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : statements.length > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Operating Activities</h3>
                    {categorizeOperations(statements).operating.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
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
                        <div>
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                        <span className={item.type === 'revenue' ? "text-green-600" : "text-red-600"}>
                          ${item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FinanceMetricCard
                      label="Total Revenues"
                      value={revenues}
                      type="revenue"
                    />
                    <FinanceMetricCard
                      label="Total Expenses"
                      value={-expenses}
                      type="expense"
                    />
                    <FinanceMetricCard
                      label="Net Income"
                      value={netIncome}
                      type="income"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No income statement data found.</p>
                  <p className="mt-2">Click "Add Entry" to get started.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeStatement;