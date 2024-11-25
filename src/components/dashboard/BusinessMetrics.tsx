import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  DollarSign,
  PieChart,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface BusinessMetric {
  id: string;
  user_id: string;
  category: string;
  metrics: Record<string, string | number>;
  recommendations: string[];
  priority: string;
  created_at: string;
}

export const BusinessMetrics = () => {
  const { session } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['business-metrics', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as BusinessMetric[];
    },
    enabled: !!session?.user.id
  });

  // Sample data for the chart - in production, this would come from your actual data
  const chartData = [
    { value: 4000 },
    { value: 3000 },
    { value: 5000 },
    { value: 2780 },
    { value: 6890 },
    { value: 7890 },
    { value: 8390 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Financial Health Score */}
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium">Financial Health</h3>
            </div>
            <span className="text-sm text-purple-500">Good</span>
          </div>
          <div className="text-3xl font-bold mb-2">85/100</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }} />
          </div>
        </Card>

        {/* Revenue Metrics */}
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <h3 className="font-medium">Revenue</h3>
            </div>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-2">$48.2K</div>
          <div className="text-sm text-green-500">+12.5% from last month</div>
        </Card>

        {/* Profit Margin */}
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Profit Margin</h3>
            </div>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold mb-2">32.8%</div>
          <div className="text-sm text-blue-500">+2.4% from last month</div>
        </Card>

        {/* Risk Score */}
        <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              <h3 className="font-medium">Risk Score</h3>
            </div>
            <ArrowDownRight className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-3xl font-bold mb-2">Low</div>
          <div className="text-sm text-green-500">-5% from last month</div>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Revenue Trend</h3>
          </div>
          <span className="text-sm text-muted-foreground">Last 7 days</span>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#9b87f5"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics?.map((metric) => (
          <Card key={metric.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{metric.category}</h3>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                metric.priority === 'high' ? 'bg-red-100 text-red-800' : 
                metric.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {metric.priority.toUpperCase()}
              </span>
            </div>
            <div className="space-y-2">
              {Object.entries(metric.metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <span className="text-sm font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};