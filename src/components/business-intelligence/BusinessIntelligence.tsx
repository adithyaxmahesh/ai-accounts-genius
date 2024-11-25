import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
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

  const pieData = [
    { name: 'Revenue', value: financialData?.totalRevenue || 0 },
    { name: 'Expenses', value: financialData?.totalExpenses || 0 },
    { name: 'Profit', value: financialData?.netIncome || 0 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

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

      {financialData && <MetricsDisplay metrics={financialData} />}

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

      <InsightsDisplay insights={insights || []} />
    </Card>
  );
};