import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Clock } from "lucide-react";

export const PaymentScheduler = () => {
  const { session } = useAuth();

  const { data: payments } = useQuery({
    queryKey: ['tax-payments', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_payment_schedules')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Payment Schedule</h2>
        <Button variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Schedule Payment
        </Button>
      </div>

      <div className="space-y-4">
        {payments?.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{payment.payment_type}</h3>
              <p className="text-sm text-muted-foreground">
                ${payment.amount?.toLocaleString()} - Due {new Date(payment.due_date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <DollarSign className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            </div>
          </div>
        ))}

        {!payments?.length && (
          <p className="text-center text-muted-foreground py-4">
            No scheduled payments. Set up your payment schedule to stay organized.
          </p>
        )}
      </div>
    </Card>
  );
};