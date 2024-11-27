import { Card } from "@/components/ui/card";
import { DollarSign, Target, PiggyBank, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFinancialData } from "@/hooks/useFinancialData";

export const FinancialMetrics = () => {
  const navigate = useNavigate();
  const { data: metrics } = useFinancialData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card 
        className="relative overflow-hidden bg-[#1A1F2C]/80 backdrop-blur-lg border border-white/10 p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group"
        onClick={() => navigate('/revenue')}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
        <div className="relative z-10">
          <DollarSign className="h-8 w-8 mb-4 text-green-500" />
          <div className="space-y-1">
            <p className="text-sm text-green-500 font-medium">Revenue</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                ${metrics?.totalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-green-500">
              {metrics?.profitMargin > 0 ? '+' : ''}{metrics?.profitMargin.toFixed(1)}% profit margin
            </p>
          </div>
        </div>
      </Card>

      <Card 
        className="relative overflow-hidden bg-[#1A1F2C]/80 backdrop-blur-lg border border-white/10 p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group"
        onClick={() => navigate('/expenses')}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
        <div className="relative z-10">
          <Receipt className="h-8 w-8 mb-4 text-red-500" />
          <div className="space-y-1">
            <p className="text-sm text-red-500 font-medium">Expenses</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                ${metrics?.totalExpenses?.toLocaleString() || '0'}
              </span>
            </div>
            <p className="text-sm text-red-500">
              {metrics?.totalExpenses ? `${((metrics.totalExpenses / metrics.totalRevenue) * 100).toFixed(1)}% of revenue` : 'No expenses recorded'}
            </p>
          </div>
        </div>
      </Card>

      <Card 
        className="relative overflow-hidden bg-[#1A1F2C]/80 backdrop-blur-lg border border-white/10 p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group"
        onClick={() => navigate('/balance-sheet')}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        <div className="relative z-10">
          <PiggyBank className="h-8 w-8 mb-4 text-blue-500" />
          <div className="space-y-1">
            <p className="text-sm text-blue-500 font-medium">Net Profit</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                ${metrics?.netIncome.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-blue-500">
              Average expense: ${metrics?.averageExpense.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card 
        className="relative overflow-hidden bg-[#1A1F2C]/80 backdrop-blur-lg border border-white/10 p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group"
        onClick={() => navigate('/balance-sheet')}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
        <div className="relative z-10">
          <PiggyBank className="h-8 w-8 mb-4 text-blue-500" />
          <div className="space-y-1">
            <p className="text-sm text-blue-500 font-medium">Cash Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                ${metrics?.cashBalance.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-blue-500">
              Available funds
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};