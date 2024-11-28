import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ExpenseTrends } from "./expenses/ExpenseTrends";
import { ExpenseAnalysis } from "./expenses/ExpenseAnalysis";
import { ExpenseRecommendations } from "./expenses/ExpenseRecommendations";
import { ExpensePieChart } from "./expenses/ExpensePieChart";
import { ExpenseList } from "./expenses/ExpenseList";
import { COLORS } from "@/utils/expenseCalculations";
import { useFinancialStreams } from "@/hooks/useFinancialStreams";

interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
}

export const ExpenseCategoriesCard = () => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>();
  const { data: streams } = useFinancialStreams();

  const expenses = streams
    ?.filter(stream => stream.type === 'expense' || stream.type === 'write_off')
    .reduce((acc, stream) => {
      const category = stream.category || 'Other';
      acc[category] = (acc[category] || 0) + stream.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseCategories = Object.entries(expenses || {}).map(([name, value]) => ({
    name,
    value: Number(value),
    color: COLORS[name as keyof typeof COLORS] || COLORS.Other
  }));

  const totalExpenses = expenseCategories.reduce((sum, exp) => sum + exp.value, 0);

  if (!expenseCategories?.length) {
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
                expenses={expenseCategories}
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              />
            </div>
            <ExpenseList expenses={expenseCategories} />
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <ExpenseAnalysis 
            expenses={expenseCategories} 
            totalExpenses={totalExpenses}
          />
        </TabsContent>

        <TabsContent value="trends">
          <ExpenseTrends expenses={expenseCategories} />
        </TabsContent>

        <TabsContent value="recommendations">
          <ExpenseRecommendations 
            expenses={expenseCategories} 
            totalExpenses={totalExpenses}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};