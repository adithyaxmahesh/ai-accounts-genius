import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, LineChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AiInsights = () => {
  const { session } = useAuth();

  const { data: insights } = useQuery({
    queryKey: ['ai-insights', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const chartData = insights?.map(insight => ({
    date: new Date(insight.created_at).toLocaleDateString(),
    confidence: insight.confidence_score
  })) || [];

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">AI Financial Insights</h2>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="confidence" stroke="#8884d8" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {insights?.map((insight) => (
          <div key={insight.id} className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {insight.category === 'trend' ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <p className="font-semibold capitalize">{insight.category}</p>
            </div>
            <p className="text-sm text-muted-foreground">{insight.insight}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};