import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const CashBalanceCard = () => {
  const { session } = useAuth();

  const { data: cashBalance, isLoading } = useQuery({
    queryKey: ['cash-balance', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('stripe-integration', {
        body: { 
          userId: session?.user.id,
          action: 'get-cash-balance'
        }
      });
      
      if (error) throw error;
      return data?.available?.[0]?.amount || 0;
    },
    enabled: !!session?.user.id
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <DollarSign className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Available Balance</h3>
          <p className="text-2xl font-bold">
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              `$${((cashBalance || 0) / 100).toFixed(2)}`
            )}
          </p>
        </div>
      </div>
    </Card>
  );
};