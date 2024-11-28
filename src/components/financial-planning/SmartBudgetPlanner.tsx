import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Calculator } from "lucide-react";
import { useFinancialData } from "@/hooks/useFinancialData";
import { ManualBudgetForm } from "./ManualBudgetForm";
import { AIRecommendations } from "./AIRecommendations";

export const SmartBudgetPlanner = () => {
  const [selectedTab, setSelectedTab] = useState("ai");
  const { data: financialData } = useFinancialData();

  // Query available cash
  const { data: cashData } = useQuery({
    queryKey: ['available-cash'],
    queryFn: async () => {
      return financialData?.cashBalance || 0;
    },
    enabled: !!financialData,
  });

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

        <TabsContent value="ai">
          <AIRecommendations />
        </TabsContent>

        <TabsContent value="manual">
          <ManualBudgetForm />
        </TabsContent>
      </Tabs>
    </Card>
  );
};