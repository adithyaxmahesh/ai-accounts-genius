import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Receipt, Clock, CheckCircle2 } from "lucide-react";

export const AccountsPayable = () => {
  const { session } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  const { data: payables = [], isError, error } = useQuery({
    queryKey: ['accounts-payable', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
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
      title: "Error loading payables",
      description: error instanceof Error ? error.message : "Failed to load payables"
    });
  }

  const displayPayables = showAll ? payables : payables.slice(0, 3);
  const totalPayables = payables.reduce((sum, p) => sum + Number(p.amount), 0);

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
        return <Receipt className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Accounts Payable</h3>
        <Button 
          variant="outline"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : "View All"}
        </Button>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Total Payables</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPayables)}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {displayPayables.map((payable) => (
            <div key={payable.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">{payable.vendor_name}</p>
                <p className="text-sm text-muted-foreground">Invoice: {payable.invoice_number}</p>
                {payable.notes && (
                  <p className="text-sm text-muted-foreground">{payable.notes}</p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  {getStatusIcon(payable.payment_status)}
                  <p className="font-semibold">{formatCurrency(Number(payable.amount))}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(payable.due_date).toLocaleDateString()}
                </p>
                {payable.payment_date && (
                  <p className="text-sm text-muted-foreground">
                    Paid: {new Date(payable.payment_date).toLocaleDateString()}
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