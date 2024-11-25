import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export const PredictiveAnalyticsDashboard = () => {
  const { session } = useAuth();

  const { data: patterns } = useQuery({
    queryKey: ['financial-patterns', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('financial-patterns', {
        body: { 
          userId: session?.user.id,
          timeframe: '6months'
        }
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id
  });

  if (!patterns) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary animate-pulse" />
          <h2 className="text-xl font-semibold">Analyzing Patterns...</h2>
        </div>
      </Card>
    );
  }

  const { seasonality, trends, predictions, anomalies, correlations } = patterns.patterns;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">AI Financial Analysis</h2>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            Confidence: {(correlations.revenueToCashFlow * 100).toFixed(1)}%
          </Badge>
        </div>
        
        <ScrollArea className="h-[100px] mb-4">
          <p className="text-muted-foreground whitespace-pre-line">
            {patterns.aiAnalysis}
          </p>
        </ScrollArea>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Revenue Predictions</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions.nextQuarter.revenue.map((value, index) => ({
                month: `Month ${index + 1}`,
                predicted: value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Seasonal Patterns</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seasonality.map(s => ({
                month: new Date(2024, s.month).toLocaleString('default', { month: 'short' }),
                strength: s.strength
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="strength" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Anomaly Detection</h3>
        </div>
        <div className="space-y-4">
          {anomalies.revenue.map((anomaly, index) => (
            <div 
              key={index}
              className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Revenue Anomaly</span>
                <Badge variant="outline" className="bg-yellow-500/10">
                  ${anomaly.value.toLocaleString()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Unusual revenue amount detected at position {anomaly.index + 1}
              </p>
            </div>
          ))}
          {anomalies.expenses.map((anomaly, index) => (
            <div 
              key={`exp-${index}`}
              className="p-4 bg-red-500/10 rounded-lg border border-red-500/20"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Expense Anomaly</span>
                <Badge variant="outline" className="bg-red-500/10">
                  ${anomaly.value.toLocaleString()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Unusual expense amount detected at position {anomaly.index + 1}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};