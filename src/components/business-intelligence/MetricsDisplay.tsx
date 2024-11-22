import { DollarSign, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface MetricsDisplayProps {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
}

export const MetricsDisplay = ({
  totalRevenue,
  totalExpenses,
  totalProfit,
}: MetricsDisplayProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-muted rounded-lg">
        <DollarSign className="h-4 w-4 text-green-500 mb-1" />
        <h3 className="text-xs font-medium">Total Revenue</h3>
        <p className="text-sm font-bold text-green-500">${totalRevenue.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <ArrowDownRight className="h-4 w-4 text-red-500 mb-1" />
        <h3 className="text-xs font-medium">Total Expenses</h3>
        <p className="text-sm font-bold text-red-500">${totalExpenses.toLocaleString()}</p>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <ArrowUpRight className="h-4 w-4 text-blue-500 mb-1" />
        <h3 className="text-xs font-medium">Net Profit</h3>
        <p className="text-sm font-bold text-blue-500">${totalProfit.toLocaleString()}</p>
      </div>
    </div>
  );
};