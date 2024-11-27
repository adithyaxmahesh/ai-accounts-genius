import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, DollarSign, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const SmartBudgetPlanner = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("ai");
  const [manualBudget, setManualBudget] = useState({
    payroll: "",
    rentAndUtilities: "",
    equipmentAndSupplies: "",
    marketingAndAdvertising: "",
    insurance: "",
    professionalServices: "",
    softwareAndSubscriptions: "",
    travelAndEntertainment: "",
    inventory: "",
    taxes: "",
    maintenanceAndRepairs: "",
    otherOperatingExpenses: "",
  });

  // Query available cash
  const { data: cashData } = useQuery({
    queryKey: ['available-cash', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('balance_sheet_items')
        .select('*')
        .eq('user_id', session?.user.id)
        .eq('category', 'current-assets');
      
      if (error) throw error;
      return data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    },
    enabled: !!session?.user.id,
  });

  // Query AI recommendations
  const { data: aiRecommendations, refetch: refetchRecommendations } = useQuery({
    queryKey: ['budget-recommendations', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_budget_recommendations')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    },
    enabled: !!session?.user.id,
  });

  const generateAIRecommendations = async () => {
    try {
      toast({
        title: "Generating Recommendations",
        description: "Analyzing your business financial data...",
      });

      await supabase.functions.invoke('analyze-budget', {
        body: { userId: session?.user.id }
      });

      await refetchRecommendations();

      toast({
        title: "Success",
        description: "Business budget recommendations generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveManualBudget = async () => {
    try {
      const { error } = await supabase
        .from('financial_planning')
        .insert({
          user_id: session?.user.id,
          plan_type: 'business-budget',
          plan_data: manualBudget,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business budget saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Business Budget Planner</h2>
          <p className="text-muted-foreground">
            Available Cash: ${cashData?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="ai">
            <Brain className="w-4 h-4 mr-2" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Calculator className="w-4 h-4 mr-2" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <Button onClick={generateAIRecommendations}>
            <Brain className="w-4 h-4 mr-2" />
            Generate Business Recommendations
          </Button>

          {aiRecommendations && (
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">Recommended Budget Allocation</h3>
              <div className="prose max-w-none">
                {aiRecommendations.recommended_spending}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(manualBudget).map(([category, value]) => (
              <div key={category} className="space-y-2">
                <Label htmlFor={category} className="capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={category}
                    type="number"
                    value={value}
                    onChange={(e) => setManualBudget(prev => ({
                      ...prev,
                      [category]: e.target.value
                    }))}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button onClick={saveManualBudget} className="w-full">
            Save Business Budget
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};