import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const OverviewInsights = () => {
  const { session } = useAuth();

  const { data: insights } = useQuery({
    queryKey: ['business-insights', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: revenueData } = useQuery({
    queryKey: ['revenue-trend', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_records')
        .select('amount, date')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: true })
        .limit(7);
      
      if (error) throw error;
      return data?.map(record => ({
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: record.amount
      }));
    }
  });

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Financial Overview</h2>
        </div>
        <Button variant="outline" className="bg-gray-800/50 border-gray-700">
          View Details
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="h-[200px] bg-gray-800/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
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
                  dataKey="amount"
                  stroke="#9b87f5"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
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
              <p className="text-xl font-bold">${revenueData?.reduce((sum, record) => sum + record.amount, 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <ArrowUpRight className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-sm text-gray-400">Growth Rate</p>
              <p className="text-xl font-bold">+12.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="space-y-4">
            {insights?.map((insight) => (
              <div key={insight.id} className="p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {insight.priority === 'high' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">{insight.category}</span>
                </div>
                <p className="text-sm text-gray-400">{insight.recommendations?.[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};