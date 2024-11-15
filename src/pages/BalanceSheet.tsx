import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AddBalanceSheetItem } from "@/components/AddBalanceSheetItem";
import { BalanceSheetSection } from "@/components/BalanceSheetSection";
import { useAuth } from "@/components/AuthProvider";

const BalanceSheet = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: balanceSheetItems, isLoading } = useQuery({
    queryKey: ["balanceSheetItems", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("balance_sheet_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const assets = balanceSheetItems?.filter(item => item.category === "asset") || [];
  const liabilities = balanceSheetItems?.filter(item => item.category === "liability") || [];
  const equity = balanceSheetItems?.filter(item => item.category === "equity") || [];

  const totalAssets = assets.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalEquity = equity.reduce((sum, item) => sum + Number(item.amount), 0);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
          <p className="text-muted-foreground">Track your financial position</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="hover-scale">
          <DollarSign className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Assets</h3>
          <p className="text-3xl font-bold text-green-600">${totalAssets.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Liabilities</h3>
          <p className="text-3xl font-bold text-red-600">${totalLiabilities.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Equity</h3>
          <p className="text-3xl font-bold text-blue-600">${totalEquity.toLocaleString()}</p>
        </Card>
      </div>

      <div className="space-y-8">
        <BalanceSheetSection
          title="Assets"
          items={assets}
          className="bg-green-50"
        />
        <BalanceSheetSection
          title="Liabilities"
          items={liabilities}
          className="bg-red-50"
        />
        <BalanceSheetSection
          title="Equity"
          items={equity}
          className="bg-blue-50"
        />
      </div>

      {showAddForm && (
        <AddBalanceSheetItem
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["balanceSheetItems"] });
            setShowAddForm(false);
            toast({
              title: "Success",
              description: "Balance sheet item added successfully",
            });
          }}
        />
      )}
    </div>
  );
};

export default BalanceSheet;