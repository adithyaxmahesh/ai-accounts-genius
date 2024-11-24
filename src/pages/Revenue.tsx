import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const Revenue = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: revenueData } = useQuery({
    queryKey: ['revenue', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id,
  });

  const chartData = revenueData?.reduce((acc: any[], curr) => {
    const month = new Date(curr.date).toLocaleDateString('default', { month: 'short' });
    const existingMonth = acc.find(item => item.month === month);
    
    if (existingMonth) {
      existingMonth.amount += Number(curr.amount);
    } else {
      acc.push({
        month,
        amount: Number(curr.amount)
      });
    }
    return acc;
  }, []) || [];

  const totalRevenue = revenueData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
  const averageRevenue = revenueData?.length ? totalRevenue / revenueData.length : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Revenue</h1>
        <Button onClick={() => navigate('/revenue/add')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Revenue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Total Revenue</h3>
          <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Average Revenue</h3>
          <p className="text-3xl font-bold">${averageRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Revenue Over Time</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Revenue;