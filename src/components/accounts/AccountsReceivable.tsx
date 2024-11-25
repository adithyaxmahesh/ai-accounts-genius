import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Clock, CheckCircle2 } from "lucide-react";

export const AccountsReceivable = () => {
  const { session } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  const { data: receivables = [], isError, error } = useQuery({
    queryKey: ['accounts-receivable', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id
  });

  if (isError) {
    toast({
      variant: "destructive",
      title: "Error loading receivables",
      description: error instanceof Error ? error.message : "Failed to load receivables"
    });
  }

  const displayReceivables = showAll ? receivables : receivables.slice(0, 3);
  const totalReceivables = receivables.reduce((sum, r) => sum + Number(r.amount), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Accounts Receivable</h3>
        <Button 
          variant="outline"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : "View All"}
        </Button>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Total Receivables</p>
            <p className="text-2xl font-bold">{formatCurrency(totalReceivables)}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {displayReceivables.map((receivable) => (
            <div key={receivable.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">{receivable.customer_name}</p>
                <p className="text-sm text-muted-foreground">Invoice: {receivable.invoice_number}</p>
                {receivable.notes && (
                  <p className="text-sm text-muted-foreground">{receivable.notes}</p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  {getStatusIcon(receivable.payment_status)}
                  <p className="font-semibold">{formatCurrency(Number(receivable.amount))}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(receivable.due_date).toLocaleDateString()}
                </p>
                {receivable.payment_date && (
                  <p className="text-sm text-muted-foreground">
                    Paid: {new Date(receivable.payment_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};