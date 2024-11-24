import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CashFlow = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: cashFlows, isLoading } = useQuery({
    queryKey: ['cash-flows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_flow_statements')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id,
  });

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : cashFlows && cashFlows.length > 0 ? (
            <div className="space-y-4">
              {cashFlows.map((flow) => (
                <div key={flow.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{flow.name}</h3>
                  <p className="text-sm text-muted-foreground">{flow.description}</p>
                  <p className="mt-2">Amount: ${flow.amount}</p>
                  <p className="text-sm">Category: {flow.category}</p>
                  <p className="text-sm">Type: {flow.type}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No cash flow statements found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlow;