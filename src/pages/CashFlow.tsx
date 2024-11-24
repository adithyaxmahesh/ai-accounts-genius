import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CashFlowMetrics } from "@/components/cash-flow/CashFlowMetrics";
import { CashFlowChart } from "@/components/cash-flow/CashFlowChart";

const CashFlow = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: cashFlowData, isLoading } = useQuery({
    queryKey: ['cash-flows', session?.user.id],
    queryFn: async () => {
      const { data: statements, error } = await supabase
        .from('cash_flow_statements')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: true });
      
      if (error) throw error;

      // Calculate metrics for each period
      const processedData = statements?.map(statement => ({
        date: new Date(statement.date).toLocaleDateString('default', { month: 'short', year: 'numeric' }),
        operatingCashFlow: statement.amount * (statement.type === 'operating' ? 1 : 0),
        financingCashFlow: statement.amount * (statement.type === 'financing' ? 1 : 0),
        freeCashFlow: statement.amount * (statement.type === 'free' ? 1 : 0),
        netCashFlow: statement.amount,
      }));

      // Calculate current period metrics
      const currentMetrics = {
        netIncome: 100000, // Example values - replace with actual calculations
        depreciation: 20000,
        workingCapitalChange: 15000,
        capitalExpenditure: 30000,
        operatingIncome: 120000,
        taxes: 25000,
        financingInflows: 50000,
        financingOutflows: 40000,
      };

      return {
        statements: processedData || [],
        metrics: currentMetrics,
      };
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

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CashFlowMetrics {...cashFlowData?.metrics} />
          <CashFlowChart data={cashFlowData?.statements || []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlow;