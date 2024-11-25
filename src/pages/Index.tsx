import { PredictiveAnalyticsDashboard } from "@/components/analytics/PredictiveAnalyticsDashboard";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { BusinessIntelligence } from "@/components/BusinessIntelligence";
import { ExpenseCategoriesCard } from "@/components/ExpenseCategoriesCard";
import { BalanceSheetSection } from "@/components/BalanceSheetSection";
import { OwnersEquity } from "@/components/OwnersEquity";
import { FraudDetection } from "@/components/fraud-detection/FraudDetection";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export const Index = () => {
  const { session } = useAuth();

  const { data: balanceSheetItems = [] } = useQuery({
    queryKey: ['balanceSheetItems', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('balance_sheet_items')
        .select('*')
        .eq('user_id', session?.user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Financial Dashboard</h1>
      
      <div className="grid gap-6">
        <FinancialMetrics />
        <PredictiveAnalyticsDashboard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BusinessIntelligence />
          <ExpenseCategoriesCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BalanceSheetSection 
            title="Balance Sheet" 
            items={balanceSheetItems}
          />
          <OwnersEquity />
        </div>
        <FraudDetection />
      </div>
    </div>
  );
};

export default Index;