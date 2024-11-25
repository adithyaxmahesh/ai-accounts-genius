import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeStatementDisplay } from "@/components/income-statement/IncomeStatementDisplay";
import { BalanceSheetSection } from "@/components/BalanceSheetSection";
import { CashFlowChart } from "@/components/cash-flow/CashFlowChart";
import { BreakEvenAnalysis } from "@/components/break-even/BreakEvenAnalysis";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export const FinancialStatements = () => {
  const { session } = useAuth();

  const { data: balanceSheetItems = [] } = useQuery({
    queryKey: ['balanceSheetItems', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('balance_sheet_items')
        .select('*')
        .eq('user_id', session?.user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id,
  });

  const { data: cashFlowData = [] } = useQuery({
    queryKey: ['cash-flows', session?.user.id],
    queryFn: async () => {
      const { data: statements, error } = await supabase
        .from('cash_flow_statements')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: true });
      
      if (error) throw error;

      // If no data exists, provide sample data for visualization
      const sampleData = statements?.length ? statements : [
        { date: '2024-01', type: 'operating', amount: 50000 },
        { date: '2024-02', type: 'operating', amount: 55000 },
        { date: '2024-03', type: 'operating', amount: 52000 },
        { date: '2024-01', type: 'financing', amount: -20000 },
        { date: '2024-02', type: 'financing', amount: -22000 },
        { date: '2024-03', type: 'financing', amount: -18000 },
      ];

      // Process the data for the chart
      const processedData = sampleData.reduce((acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString('default', { month: 'short', year: 'numeric' });
        const existingEntry = acc.find(entry => entry.date === date);

        if (existingEntry) {
          if (curr.type === 'operating') {
            existingEntry.operatingCashFlow = Number(curr.amount);
          } else if (curr.type === 'financing') {
            existingEntry.financingCashFlow = Number(curr.amount);
          }
          existingEntry.freeCashFlow = existingEntry.operatingCashFlow - Math.abs(existingEntry.financingCashFlow);
          existingEntry.netCashFlow = existingEntry.operatingCashFlow + existingEntry.financingCashFlow;
        } else {
          acc.push({
            date,
            operatingCashFlow: curr.type === 'operating' ? Number(curr.amount) : 0,
            financingCashFlow: curr.type === 'financing' ? Number(curr.amount) : 0,
            freeCashFlow: curr.type === 'operating' ? Number(curr.amount) : 0,
            netCashFlow: Number(curr.amount),
          });
        }
        return acc;
      }, [] as Array<{
        date: string;
        operatingCashFlow: number;
        financingCashFlow: number;
        freeCashFlow: number;
        netCashFlow: number;
      }>);

      return processedData;
    },
    enabled: !!session?.user.id,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Financial Statements</h1>
      
      <Tabs defaultValue="income" className="w-full">
        <TabsList>
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="breakeven">Break-Even Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income">
          <IncomeStatementDisplay />
        </TabsContent>
        
        <TabsContent value="balance">
          <BalanceSheetSection 
            title="Balance Sheet" 
            items={balanceSheetItems}
          />
        </TabsContent>
        
        <TabsContent value="cashflow">
          <CashFlowChart data={cashFlowData} />
        </TabsContent>
        
        <TabsContent value="breakeven">
          <BreakEvenAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialStatements;