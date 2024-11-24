import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const CashFlow = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: cashFlowStatements, isLoading } = useQuery({
    queryKey: ["cashFlowStatements", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cash_flow_statements")
        .select("*")
        .eq("user_id", session?.user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="hover:scale-105 transition-transform"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold">Cash Flow Statement</h1>
        <p className="text-muted-foreground">Monitor your cash inflows and outflows</p>
      </header>

      <div className="grid gap-6">
        {cashFlowStatements?.map((statement) => (
          <Card key={statement.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{statement.name}</h3>
                <p className="text-sm text-muted-foreground">{statement.description}</p>
              </div>
              <p className={`text-lg font-semibold ${statement.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                ${statement.amount.toLocaleString()}
              </p>
            </div>
          </Card>
        ))}

        {(!cashFlowStatements || cashFlowStatements.length === 0) && (
          <p className="text-center text-muted-foreground">No cash flow statements found</p>
        )}
      </div>
    </div>
  );
};

export default CashFlow;