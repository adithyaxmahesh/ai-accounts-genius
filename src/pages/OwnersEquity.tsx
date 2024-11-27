import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EquityStatement {
  id: string;
  category: string;
  name: string;
  amount: number;
  type: string;
  description: string | null;
  date: string;
}

const OwnersEquity = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: equityStatements, isLoading } = useQuery({
    queryKey: ['owners-equity', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('owners_equity_statements')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as EquityStatement[];
    },
    enabled: !!session?.user.id,
  });

  const calculateEquityComponents = (statements: EquityStatement[] = []) => {
    const openingBalance = statements.find(s => s.category === 'opening_balance')?.amount || 0;
    const netIncome = statements
      .filter(s => s.category === 'net_income')
      .reduce((sum, s) => sum + s.amount, 0);
    const withdrawals = statements
      .filter(s => s.category === 'withdrawal')
      .reduce((sum, s) => sum + s.amount, 0);
    const otherChanges = statements
      .filter(s => s.category === 'adjustment')
      .reduce((sum, s) => sum + s.amount, 0);
    
    const closingBalance = openingBalance + netIncome - withdrawals + otherChanges;

    return {
      openingBalance,
      netIncome,
      withdrawals,
      otherChanges,
      closingBalance
    };
  };

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  const equityComponents = calculateEquityComponents(equityStatements);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Owner's Equity Statement</h1>
        </div>
        <Button onClick={() => toast({ title: "Coming soon!", description: "This feature will be available soon." })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Opening Balance</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              ${equityComponents.openingBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Net Income</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              ${equityComponents.netIncome.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold">Withdrawals</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">
              ${equityComponents.withdrawals.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Closing Balance</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              ${equityComponents.closingBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Statement</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : equityStatements && equityStatements.length > 0 ? (
            <div className="space-y-4">
              {equityStatements.map((statement) => (
                <div
                  key={statement.id}
                  className="flex justify-between items-center p-4 bg-muted rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{statement.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(statement.date).toLocaleDateString()}
                    </p>
                    {statement.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {statement.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      statement.category === 'withdrawal' ? 'text-red-600' :
                      statement.category === 'net_income' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      ${statement.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {statement.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No equity statements found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnersEquity;
