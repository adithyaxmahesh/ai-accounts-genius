import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AgingReport = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: payables = [], isError: isPayablesError } = useQuery({
    queryKey: ['aging-payables', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('payment_status', 'pending');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id
  });

  const { data: receivables = [], isError: isReceivablesError } = useQuery({
    queryKey: ['aging-receivables', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('payment_status', 'pending');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id
  });

  if (isPayablesError || isReceivablesError) {
    toast({
      variant: "destructive",
      title: "Error loading aging report",
      description: "Failed to load aging data"
    });
  }

  const calculateAging = (items: any[]) => {
    const now = new Date();
    return items.reduce((acc: any, item) => {
      const dueDate = new Date(item.due_date);
      const daysDiff = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff <= 30) acc.current += Number(item.amount);
      else if (daysDiff <= 60) acc.thirty += Number(item.amount);
      else if (daysDiff <= 90) acc.sixty += Number(item.amount);
      else acc.ninety += Number(item.amount);
      
      return acc;
    }, { current: 0, thirty: 0, sixty: 0, ninety: 0 });
  };

  const payablesAging = calculateAging(payables);
  const receivablesAging = calculateAging(receivables);

  const chartData = [
    {
      name: 'Current',
      Payables: payablesAging.current,
      Receivables: receivablesAging.current,
    },
    {
      name: '30-60 Days',
      Payables: payablesAging.thirty,
      Receivables: receivablesAging.thirty,
    },
    {
      name: '60-90 Days',
      Payables: payablesAging.sixty,
      Receivables: receivablesAging.sixty,
    },
    {
      name: '90+ Days',
      Payables: payablesAging.ninety,
      Receivables: receivablesAging.ninety,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Aging Report</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: 'black' }}
            />
            <Legend />
            <Bar dataKey="Receivables" fill="#22c55e" />
            <Bar dataKey="Payables" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};