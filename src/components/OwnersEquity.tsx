import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";

export const OwnersEquity = () => {
  const { session } = useAuth();

  const { data: equityStatements } = useQuery({
    queryKey: ['owners-equity', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('owners_equity_statements')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const latestStatement = equityStatements?.[equityStatements.length - 1];
  const previousStatement = equityStatements?.[equityStatements.length - 2];

  const netChange = latestStatement && previousStatement
    ? latestStatement.amount - previousStatement.amount
    : 0;

  const chartData = equityStatements?.map(statement => ({
    date: new Date(statement.date).toLocaleDateString(),
    equity: statement.amount
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <DollarSign className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Current Equity</h3>
          <p className="text-3xl font-bold">
            ${latestStatement?.amount.toLocaleString() || '0'}
          </p>
        </Card>

        <Card className="p-6">
          <TrendingUp className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Net Change</h3>
          <div className="flex items-center">
            {netChange >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-2" />
            )}
            <p className={`text-3xl font-bold ${netChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(netChange).toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Equity Trend</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="equity" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-4">
          {equityStatements?.slice(-5).reverse().map((statement) => (
            <div 
              key={statement.id} 
              className="flex justify-between items-center p-4 bg-muted rounded-lg"
            >
              <div>
                <p className="font-semibold">{statement.name}</p>
                <p className="text-sm text-muted-foreground">{statement.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${statement.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(statement.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};