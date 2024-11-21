import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Forecast {
  id: string;
  period_start: string;
  period_end: string;
  predicted_revenue: number;
  confidence_level: number | null;
  factors: any | null;
  created_at: string;
  user_id: string | null;
}

export const FinancialForecast = () => {
  const { session } = useAuth();

  const { data: forecasts } = useQuery<Forecast[]>({
    queryKey: ['forecasts', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('period_start', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={forecasts}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period_start" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="predicted_revenue" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};
