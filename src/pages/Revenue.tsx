import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, DollarSign, TrendingUp, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { RevenueSourcesManager } from "@/components/revenue/RevenueSourcesManager";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const Revenue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  // Enable real-time updates
  useRealtimeSubscription('revenue_records', ['revenue', session?.user.id]);

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const monthlyRevenue = revenueData?.reduce((acc, curr) => {
    const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + Number(curr.amount);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyRevenue || {}).map(([month, amount]) => ({
    month,
    amount
  }));

  const totalRevenue = revenueData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
  const monthlyAverage = totalRevenue / (Object.keys(monthlyRevenue || {}).length || 1);

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
        <h1 className="text-3xl font-bold">Revenue Analysis</h1>
        <Button onClick={() => {}} className="hover-scale">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      <RevenueSourcesManager />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 glass-card">
          <DollarSign className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-3xl font-bold">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">All time</p>
        </Card>
        
        <Card className="p-6 glass-card">
          <TrendingUp className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Monthly Average</h3>
          <p className="text-3xl font-bold">
            ${monthlyAverage.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Per month</p>
        </Card>
      </div>

      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Revenue Trend</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#9b87f5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 glass-card">
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {revenueData?.slice(0, 5).map((record) => (
            <div key={record.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">{record.description || record.category}</p>
                <p className="text-sm text-muted-foreground">{record.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${Number(record.amount).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Revenue;
