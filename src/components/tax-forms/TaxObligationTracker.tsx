import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle } from "lucide-react";

export const TaxObligationTracker = () => {
  const { session } = useAuth();

  const { data: obligations } = useQuery({
    queryKey: ['tax-obligations', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_tax_obligations')
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
        <h2 className="text-xl font-semibold">Tax Obligations</h2>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Add Obligation
        </Button>
      </div>

      <div className="space-y-4">
        {obligations?.map((obligation) => (
          <div
            key={obligation.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{obligation.obligation_type}</h3>
                {new Date(obligation.due_date) <= new Date() && (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Form {obligation.form_number} - Due {new Date(obligation.due_date).toLocaleDateString()}
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        ))}

        {!obligations?.length && (
          <p className="text-center text-muted-foreground py-4">
            No tax obligations found. Add some to start tracking.
          </p>
        )}
      </div>
    </Card>
  );
};