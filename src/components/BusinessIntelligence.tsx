import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

export const BusinessIntelligence = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: insights, refetch, isLoading } = useQuery({
    queryKey: ['business-insights', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("User must be authenticated");
      }

      const { data, error } = await supabase
        .from('business_insights')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    },
    enabled: !!session?.user?.id
  });

  const generateInsights = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate insights.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Generating Insights",
        description: "Analyzing your business data...",
      });

      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { 
          userId: session.user.id 
        }
      });

      if (error) throw error;

      await refetch();

      toast({
        title: "Insights Generated",
        description: "New business insights are available",
      });
    } catch (error: any) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pieData = [
    { name: 'Revenue', value: insights?.metrics?.revenue || 0 },
    { name: 'Expenses', value: insights?.metrics?.expenses || 0 },
    { name: 'Profit', value: insights?.metrics?.profit || 0 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Business Intelligence</h2>
        </div>
        <Button onClick={generateInsights} className="hover-scale">
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate New Insights
        </Button>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-6">
        {insights?.recommendations?.map((recommendation: string, index: number) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-medium">Recommendation {index + 1}</span>
              </div>
              {insights.metrics?.growth > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{recommendation}</p>
            </div>
          </div>
        ))}

        {!insights?.recommendations?.length && (
          <div className="text-center text-muted-foreground py-4">
            No insights available. Click "Generate New Insights" to analyze your business data.
          </div>
        )}
      </div>
    </Card>
  );
};