import { DollarSign, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { FinancialMetrics } from "@/hooks/useFinancialData";

interface MetricsDisplayProps {
  metrics: FinancialMetrics;
}

export const MetricsDisplay = ({ metrics }: MetricsDisplayProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-muted rounded-lg">
        <DollarSign className="h-4 w-4 text-green-500 mb-1" />
        <h3 className="text-xs font-medium">Total Revenue</h3>
        <p className="text-sm font-bold text-green-500">${metrics.totalRevenue.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <ArrowDownRight className="h-4 w-4 text-red-500 mb-1" />
        <h3 className="text-xs font-medium">Total Expenses</h3>
        <p className="text-sm font-bold text-red-500">${metrics.totalExpenses.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <ArrowUpRight className="h-4 w-4 text-blue-500 mb-1" />
        <h3 className="text-xs font-medium">Net Income</h3>
        <p className="text-sm font-bold text-blue-500">${metrics.netIncome.toLocaleString()}</p>
      </div>
    </div>
  );
};