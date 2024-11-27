import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CashFlowMetrics } from "@/components/cash-flow/CashFlowMetrics";
import { CashFlowChart } from "@/components/cash-flow/CashFlowChart";
import { ArrowLeft } from "lucide-react";

const CashFlow = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: cashFlowData, isLoading } = useQuery({
    queryKey: ['cash-flows', session?.user.id],
    queryFn: async () => {
      // Fetch operating cash flow data
      const { data: operatingData, error: operatingError } = await supabase
        .from('cash_flow_statements')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('type', 'operating')
        .order('date', { ascending: true });

      if (operatingError) throw operatingError;

      // Fetch financing cash flow data
      const { data: financingData, error: financingError } = await supabase
        .from('cash_flow_statements')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('type', 'financing')
        .order('date', { ascending: true });

      if (financingError) throw financingError;

      // Calculate current period metrics
      const currentMetrics = {
        netIncome: operatingData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0,
        depreciation: operatingData?.filter(record => record.category === 'depreciation')
          .reduce((sum, record) => sum + Number(record.amount), 0) || 0,
        workingCapitalChange: operatingData?.filter(record => record.category === 'working_capital')
          .reduce((sum, record) => sum + Number(record.amount), 0) || 0,
        capitalExpenditure: financingData?.filter(record => record.category === 'capex')
          .reduce((sum, record) => sum + Number(record.amount), 0) || 0,
        operatingIncome: operatingData?.filter(record => record.category === 'operating_income')
          .reduce((sum, record) => sum + Number(record.amount), 0) || 0,
        taxes: operatingData?.filter(record => record.category === 'taxes')
          .reduce((sum, record) => sum + Number(record.amount), 0) || 0,
        financingInflows: financingData?.filter(record => Number(record.amount) > 0)
          .reduce((sum, record) => sum + Number(record.amount), 0) || 0,
        financingOutflows: financingData?.filter(record => Number(record.amount) < 0)
          .reduce((sum, record) => sum + Math.abs(Number(record.amount)), 0) || 0,
      };

      // Process the data for the chart
      const dates = [...new Set([
        ...(operatingData?.map(d => d.date) || []),
        ...(financingData?.map(d => d.date) || [])
      ])].sort();

      const processedData = dates.map(date => {
        const operatingCashFlow = operatingData
          ?.filter(d => d.date === date)
          .reduce((sum, record) => sum + Number(record.amount), 0) || 0;

        const financingCashFlow = financingData
          ?.filter(d => d.date === date)
          .reduce((sum, record) => sum + Number(record.amount), 0) || 0;

        return {
          date: new Date(date).toLocaleDateString('default', { month: 'short', year: 'numeric' }),
          operatingCashFlow,
          financingCashFlow,
          freeCashFlow: operatingCashFlow - Math.abs(financingCashFlow),
          netCashFlow: operatingCashFlow + financingCashFlow,
        };
      });

      return {
        statements: processedData,
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
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CashFlowMetrics {...cashFlowData?.metrics} />
          {cashFlowData?.statements && cashFlowData.statements.length > 0 ? (
            <CashFlowChart data={cashFlowData.statements} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No cash flow data available. Add some transactions to see the chart.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlow;