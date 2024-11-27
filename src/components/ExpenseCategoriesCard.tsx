import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { ExpenseTrends } from "./expenses/ExpenseTrends";
import { ExpenseAnalysis } from "./expenses/ExpenseAnalysis";
import { ExpenseRecommendations } from "./expenses/ExpenseRecommendations";
import { WriteOff } from "@/components/types";
import { ExpensePieChart } from "./expenses/ExpensePieChart";
import { ExpenseList } from "./expenses/ExpenseList";
import { calculateExpenseCategories, COLORS } from "@/utils/expenseCalculations";

interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

export const ExpenseCategoriesCard = () => {
  const { session } = useAuth();
  const [activeIndex, setActiveIndex] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'amount' | 'category'>('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: expenses } = useQuery({
    queryKey: ['categorized-expenses', session?.user.id],
    queryFn: async () => {
      const { data: writeOffs, error } = await supabase
        .from('write_offs')
        .select(`
          amount,
          description,
          date,
          tax_codes (
            expense_category
          )
        `)
        .eq('user_id', session?.user.id)
        .returns<WriteOff[]>();

      if (error) throw error;

      const categories = calculateExpenseCategories(writeOffs || []);
      
      return Object.entries(categories).map(([name, value]) => ({
        name,
        value: Number(value),
        color: COLORS[name as keyof typeof COLORS]
      })) as ExpenseCategory[];
    },
    enabled: !!session?.user.id
  });

  const sortedExpenses = expenses?.slice().sort((a, b) => {
    const compareValue = sortBy === 'amount' 
      ? a.value - b.value
      : a.name.localeCompare(b.name);
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.value, 0) || 0;

  if (!expenses?.length) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Expense Categories</h3>
        <div className="text-center text-muted-foreground">
          No categorized expenses yet
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[300px]">
              <ExpensePieChart
                expenses={sortedExpenses || []}
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              />
            </div>
            <ExpenseList expenses={sortedExpenses || []} />
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <ExpenseAnalysis 
            expenses={sortedExpenses || []} 
            totalExpenses={totalExpenses}
          />
        </TabsContent>

        <TabsContent value="trends">
          <ExpenseTrends expenses={sortedExpenses || []} />
        </TabsContent>

        <TabsContent value="recommendations">
          <ExpenseRecommendations 
            expenses={sortedExpenses || []} 
            totalExpenses={totalExpenses}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};