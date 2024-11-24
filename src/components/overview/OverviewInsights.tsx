import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useRealtimeFinancials } from "@/hooks/useRealtimeFinancials";

export const OverviewInsights = () => {
  const { revenue, expenses, netIncome, growthRate, chartData } = useRealtimeFinancials();

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Financial Overview (Last 24h)</h2>
        </div>
        <Button variant="outline" className="bg-gray-800/50 border-gray-700">
          View Details
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-[200px] bg-gray-800/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#9b87f5"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-xl font-bold">${revenue.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-sm text-gray-400">Total Expenses</p>
              <p className="text-xl font-bold">${expenses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div className="p-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Income</span>
                <span className={`text-lg font-bold ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${netIncome.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Growth Rate</span>
                <span className={`text-lg font-bold ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {growthRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};