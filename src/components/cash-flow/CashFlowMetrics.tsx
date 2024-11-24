import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Wallet, LineChart } from "lucide-react";

interface CashFlowMetricsProps {
  netIncome: number;
  depreciation: number;
  workingCapitalChange: number;
  capitalExpenditure: number;
  operatingIncome: number;
  taxes: number;
  financingInflows: number;
  financingOutflows: number;
}

export const CashFlowMetrics = ({
  netIncome,
  depreciation,
  workingCapitalChange,
  capitalExpenditure,
  operatingIncome,
  taxes,
  financingInflows,
  financingOutflows,
}: CashFlowMetricsProps) => {
  // Calculate different cash flow metrics
  const freeCashFlow = netIncome + depreciation - workingCapitalChange - capitalExpenditure;
  const operatingCashFlow = operatingIncome + depreciation - taxes + workingCapitalChange;
  const financingCashFlow = financingInflows - financingOutflows;
  const netCashFlow = operatingCashFlow + financingCashFlow;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold">Free Cash Flow</h3>
        </div>
        <p className="text-2xl font-bold">${freeCashFlow.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">
          Net Income + Depreciation - Working Capital - CapEx
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Operating Cash Flow</h3>
        </div>
        <p className="text-2xl font-bold">${operatingCashFlow.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">
          Operating Income + Depreciation - Taxes + Working Capital
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Financing Cash Flow</h3>
        </div>
        <p className="text-2xl font-bold">${financingCashFlow.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">
          Financing Inflows - Financing Outflows
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <LineChart className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold">Net Cash Flow</h3>
        </div>
        <p className="text-2xl font-bold">${netCashFlow.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">
          Operating Cash Flow + Financing Cash Flow
        </p>
      </Card>
    </div>
  );
};