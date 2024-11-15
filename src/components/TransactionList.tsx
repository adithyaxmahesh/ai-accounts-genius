import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const TransactionList = () => {
  const { session } = useAuth();
  const [showAll, setShowAll] = useState(false);

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const displayTransactions = showAll ? transactions : transactions.slice(0, 3);

  return (
    <Card className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Recent Transactions</h3>
        <Button 
          variant="outline" 
          className="hover-scale"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : "View All"}
        </Button>
      </div>
      <ScrollArea className={cn("space-y-4", showAll ? "max-h-[400px]" : "max-h-fit")}>
        {displayTransactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No transactions found
          </div>
        ) : (
          displayTransactions.map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center p-4 bg-muted rounded-lg mb-2">
              <div>
                <p className="font-semibold">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">Category: {transaction.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </Card>
  );
};