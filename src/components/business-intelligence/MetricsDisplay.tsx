import { DollarSign, Activity, Percent, Shield } from "lucide-react";
import { FinancialMetrics } from "@/hooks/useFinancialData";

interface MetricsDisplayProps {
  metrics: FinancialMetrics;
}

export const MetricsDisplay = ({ metrics }: MetricsDisplayProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <h3 className="text-sm font-medium text-purple-500">Financial Health</h3>
          </div>
        </div>
        <p className="text-3xl font-bold mb-2">85/100</p>
        <div className="w-full bg-purple-950/50 rounded-full h-1.5">
          <div 
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: '85%' }}
          />
        </div>
        <p className="text-sm text-purple-500 mt-2">Good</p>
      </div>

      <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-sm font-medium text-green-500">Revenue</h3>
          </div>
        </div>
        <p className="text-3xl font-bold mb-2">${metrics.totalRevenue.toLocaleString()}</p>
        <p className="text-sm text-green-500">+12.5% from last month</p>
      </div>

      <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-medium text-blue-500">Profit Margin</h3>
          </div>
        </div>
        <p className="text-3xl font-bold mb-2">{metrics.profitMargin.toFixed(1)}%</p>
        <p className="text-sm text-blue-500">+2.4% from last month</p>
      </div>

      <div className="p-6 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            <h3 className="text-sm font-medium text-yellow-500">Risk Score</h3>
          </div>
        </div>
        <p className="text-3xl font-bold mb-2">Low</p>
        <p className="text-sm text-red-500">-5% from last month</p>
      </div>
    </div>
  );
};