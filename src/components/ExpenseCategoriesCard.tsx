import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseTrends } from "./expenses/ExpenseTrends";
import { ExpenseAnalysis } from "./expenses/ExpenseAnalysis";
import { ExpenseRecommendations } from "./expenses/ExpenseRecommendations";
import { WriteOff } from "@/components/types";

const COLORS = {
  'Operational': '#0088FE',
  'Employee & Payroll': '#00C49F',
  'Travel & Entertainment': '#FFBB28',
  'Marketing & Advertising': '#FF8042',
  'Professional Services': '#8884d8',
  'Insurance': '#82ca9d',
  'Taxes & Licenses': '#ffc658',
  'Equipment & Assets': '#ff7c43',
  'Technology & IT': '#665191',
  'Financial': '#a05195',
  'Research & Development': '#2f4b7c',
  'Training & Education': '#f95d6a',
  'Utilities': '#d45087',
  'Miscellaneous': '#a05195',
  'Sustainability': '#665191'
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

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

      const categories: Record<string, number> = (writeOffs || []).reduce((acc, writeOff) => {
        const baseCategory = writeOff.tax_codes?.expense_category || 'Miscellaneous';
        const category = Object.keys(COLORS).find(c => 
          baseCategory.toLowerCase().includes(c.toLowerCase())
        ) || 'Miscellaneous';
        
        acc[category] = (acc[category] || 0) + Math.abs(Number(writeOff.amount));
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categories).map(([name, value]) => ({
        name,
        value,
        color: COLORS[name as keyof typeof COLORS]
      }));
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sortedExpenses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                  >
                    {sortedExpenses?.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {sortedExpenses?.map((category) => (
                  <div 
                    key={category.name}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="font-semibold">
                      ${category.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
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