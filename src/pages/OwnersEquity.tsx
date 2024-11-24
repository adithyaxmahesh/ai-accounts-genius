import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const OwnersEquity = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: equityStatements, isLoading } = useQuery({
    queryKey: ["ownersEquityStatements", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owners_equity_statements")
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
        <h1 className="text-3xl font-bold">Owner's Equity Statement</h1>
        <p className="text-muted-foreground">Track changes in owner's equity</p>
      </header>

      <div className="grid gap-6">
        {equityStatements?.map((statement) => (
          <Card key={statement.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{statement.name}</h3>
                <p className="text-sm text-muted-foreground">{statement.description}</p>
              </div>
              <p className={`text-lg font-semibold ${statement.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                ${statement.amount.toLocaleString()}
              </p>
            </div>
          </Card>
        ))}

        {(!equityStatements || equityStatements.length === 0) && (
          <p className="text-center text-muted-foreground">No owner's equity statements found</p>
        )}
      </div>
    </div>
  );
};

export default OwnersEquity;