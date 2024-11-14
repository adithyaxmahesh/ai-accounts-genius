import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, TrendingUp, Brain, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const Forecast = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  const { data: forecasts, isLoading } = useQuery({
    queryKey: ['forecasts', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('period_start', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const generateNewForecast = async () => {
    toast({
      title: "Generating Forecast",
      description: "AI is analyzing historical data to generate a new forecast...",
    });
    // Here we would typically call an edge function to generate the forecast
  };

  const chartData = forecasts?.map(forecast => ({
    date: new Date(forecast.period_start).toLocaleDateString(),
    actual: forecast.predicted_revenue,
    predicted: forecast.predicted_revenue * (1 + (Math.random() * 0.2 - 0.1)) // Simulated variation
  }));

  return (
    <div className="container mx-auto p-6 space-y-6 fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="hover-scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Forecast</h1>
        <Button onClick={generateNewForecast} className="hover-scale">
          <Brain className="mr-2 h-4 w-4" />
          Generate New Forecast
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 glass-card">
          <TrendingUp className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Projected Growth</h3>
          <p className="text-3xl font-bold">8.3%</p>
          <p className="text-sm text-muted-foreground">Next quarter</p>
        </Card>
        
        <Card className="p-6 glass-card">
          <AlertTriangle className="h-8 w-8 mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold">Confidence Level</h3>
          <p className="text-3xl font-bold">92%</p>
          <p className="text-sm text-muted-foreground">Based on historical data</p>
        </Card>
      </div>

      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Revenue Forecast</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="actual" stroke="#9b87f5" strokeWidth={2} />
              <Line type="monotone" dataKey="predicted" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold">Seasonal Trends</h4>
            <p className="text-sm text-muted-foreground">
              Historical data shows strong performance in Q4, suggesting increased holiday season revenue.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold">Growth Factors</h4>
            <p className="text-sm text-muted-foreground">
              New product launches and market expansion are expected to drive 15% YoY growth.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold">Risk Factors</h4>
            <p className="text-sm text-muted-foreground">
              Market volatility and competitive pressure may impact growth targets.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Forecast;