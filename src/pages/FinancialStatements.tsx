import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeStatementDisplay } from "@/components/income-statement/IncomeStatementDisplay";
import { BalanceSheetSection } from "@/components/BalanceSheetSection";
import { CashFlowChart } from "@/components/cash-flow/CashFlowChart";
import { BreakEvenAnalysis } from "@/components/break-even/BreakEvenAnalysis";

export const FinancialStatements = () => {
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
          <BalanceSheetSection />
        </TabsContent>
        
        <TabsContent value="cashflow">
          <CashFlowChart />
        </TabsContent>
        
        <TabsContent value="breakeven">
          <BreakEvenAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialStatements;