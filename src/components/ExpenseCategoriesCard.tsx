import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, DollarSign, TrendingDown, TrendingUp } from "lucide-react";

interface WriteOff {
  amount: number;
  description: string;
  date: string;
  tax_codes: {
    expense_category: string;
  } | null;
}

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

      const categories = (writeOffs || []).reduce((acc, writeOff) => {
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
  const avgExpensePerCategory = totalExpenses / (expenses?.length || 1);
  const highestExpense = Math.max(...(expenses?.map(e => e.value) || [0]));
  const lowestExpense = Math.min(...(expenses?.map(e => e.value) || [0]));

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
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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

            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <h4 className="font-semibold">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-semibold">${totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Highest</p>
                    <p className="font-semibold">${highestExpense.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lowest</p>
                    <p className="font-semibold">${lowestExpense.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="font-semibold">${avgExpensePerCategory.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Detailed Breakdown</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'amount') {
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    }
                    setSortBy('amount');
                  }}
                >
                  Sort by Amount
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'category') {
                      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    }
                    setSortBy('category');
                  }}
                >
                  Sort by Category
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[400px]">
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

        <TabsContent value="metrics">
          <div className="space-y-4">
            <h4 className="font-semibold">Expense Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedExpenses?.map((category) => {
                const percentage = (category.value / totalExpenses) * 100;
                return (
                  <div 
                    key={category.name}
                    className="p-4 bg-muted rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        ${category.value.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        of ${totalExpenses.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};