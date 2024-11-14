import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const TransactionList = () => {
  const { session } = useAuth();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('date', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <Card className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Recent Transactions</h3>
        <Button variant="outline" className="hover-scale">View All</Button>
      </div>
      <div className="space-y-4">
        {transactions?.map((transaction) => (
          <div key={transaction.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <p className="font-semibold">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">Category: {transaction.category}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{transaction.date}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};