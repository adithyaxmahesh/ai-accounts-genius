import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useFinancialData } from "@/hooks/useFinancialData";
import { MetricsDisplay } from "./MetricsDisplay";
import { InsightsDisplay } from "./InsightsDisplay";
import { useQuery } from "@tanstack/react-query";

export const BusinessIntelligence = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const { data: financialData } = useFinancialData();

  const { data: insights, refetch } = useQuery({
    queryKey: ['business-insights', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data || [];
    }
  });

  const generateInsights = async () => {
    try {
      toast({
        title: "Generating Insights",
        description: "Analyzing your business data...",
      });

      const { error } = await supabase.functions.invoke('generate-insights', {
        body: { 
          userId: session?.user.id 
        }
      });

      if (error) throw error;

      await refetch();

      toast({
        title: "Insights Generated",
        description: "New business insights are available",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 border-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Business Intelligence</h2>
        </div>
        <Button 
          onClick={generateInsights} 
          variant="outline"
          className="bg-primary/10 border-primary/20 hover:bg-primary/20"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate New Insights
        </Button>
      </div>

      {financialData && <MetricsDisplay metrics={financialData} />}

      <div className="h-[200px] mb-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">Revenue Trend</h3>
          <span className="text-xs text-gray-500">Last 7 days</span>
        </div>
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

      <InsightsDisplay insights={insights || []} />
    </Card>
  );
};