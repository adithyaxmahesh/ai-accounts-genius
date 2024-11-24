import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface WriteOff {
  amount: number;
  description: string;
  date: string;
  tax_codes: {
    expense_category: string;
  } | null;
}

export const ExpenseCategoriesCard = () => {
  const { session } = useAuth();

  const { data: expenses } = useQuery({
    queryKey: ['categorized-expenses', session?.user.id],
    queryFn: async () => {
      // Fetch write-offs with their associated tax codes
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

      // Group expenses by category
      const categories = (writeOffs || []).reduce((acc, writeOff) => {
        const category = writeOff.tax_codes?.expense_category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + Math.abs(Number(writeOff.amount));
        return acc;
      }, {} as Record<string, number>);

      // Transform into chart data format
      return Object.entries(categories).map(([name, value]) => ({
        name,
        value
      }));
    },
    enabled: !!session?.user.id
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
      <h3 className="text-xl font-semibold mb-4">Expense Categories</h3>
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
            <div key={category.name} className="flex justify-between items-center p-2">
              <span className="font-medium">{category.name}</span>
              <span>${category.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};