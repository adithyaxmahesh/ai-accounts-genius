import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const ExpenseCategoriesCard = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: expenses } = useQuery({
    queryKey: ['categorized-expenses', session?.user.id],
    queryFn: async () => {
      // First get all write-offs
      const { data: writeOffs, error } = await supabase
        .from('write_offs')
        .select(`
          amount,
          description,
          tax_codes (
            expense_category
          )
        `)
        .eq('user_id', session?.user.id);

      if (error) throw error;

      // For uncategorized expenses, get AI categorization
      const uncategorized = writeOffs?.filter(wo => !wo.tax_codes?.expense_category);
      if (uncategorized?.length > 0) {
        const { data: aiCategories } = await supabase.functions.invoke('categorize-expenses', {
          body: { 
            expenses: uncategorized.map(exp => ({
              description: exp.description,
              amount: exp.amount
            }))
          }
        });

        // Merge AI categorizations with existing data
        writeOffs?.forEach(wo => {
          if (!wo.tax_codes?.expense_category) {
            const aiCat = aiCategories?.categories?.find(c => 
              c.description === wo.description
            );
            if (aiCat) {
              wo.tax_codes = { expense_category: aiCat.category };
            }
          }
        });
      }

      const categories = writeOffs?.reduce((acc, curr) => {
        const category = curr.tax_codes?.expense_category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + Number(curr.amount);
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categories || {}).map(([name, value]) => ({
        name,
        value
      }));
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Expense Categories</h3>
        <Brain className="h-5 w-5 text-primary animate-pulse" />
      </div>
      <ScrollArea className="h-[300px]">
        <div className="h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenses}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenses?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {expenses?.map((category, index) => (
            <div key={category.name} className="flex justify-between items-center p-2 bg-muted rounded-lg">
              <span className="font-medium">{category.name}</span>
              <span>${category.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};