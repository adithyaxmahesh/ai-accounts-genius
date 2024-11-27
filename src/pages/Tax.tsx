import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { TaxSummary } from "@/components/tax-analysis/TaxSummary";
import { TaxObligationTracker } from "@/components/tax-forms/TaxObligationTracker";
import { PaymentScheduler } from "@/components/tax-forms/PaymentScheduler";
import { TaxPlanner } from "@/components/tax-analysis/TaxPlanner";
import { TaxChat } from "@/components/tax-analysis/TaxChat";
import { TaxFormGenerator } from "@/components/tax-forms/TaxFormGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/integrations/supabase/types";

type TaxAnalysis = Database['public']['Tables']['tax_analysis']['Row'] & {
  recommendations?: {
    items?: Array<{
      description: string;
      amount: number;
      status?: 'approved' | 'rejected' | 'pending';
      rule?: string;
    }>;
    total_revenue?: number;
    total_deductions?: number;
    taxable_income?: number;
    effective_rate?: number;
  };
};

const defaultAnalysis: TaxAnalysis = {
  id: '',
  user_id: '',
  analysis_type: '',
  recommendations: {
    items: [],
    total_revenue: 0,
    total_deductions: 0,
    taxable_income: 0,
    effective_rate: 0
  },
  tax_impact: 0,
  jurisdiction: '',
  created_at: new Date().toISOString()
};

const Tax = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: analysis } = useQuery<TaxAnalysis>({
    queryKey: ['tax-analysis', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();
      
      if (error) throw error;
      return data as TaxAnalysis;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Tax Management</h1>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full justify-start border-b bg-muted/50 p-0 h-auto">
              <TabsTrigger 
                value="summary" 
                className="px-6 py-3 data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger 
                value="forms"
                className="px-6 py-3 data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Tax Forms
              </TabsTrigger>
              <TabsTrigger 
                value="obligations"
                className="px-6 py-3 data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Obligations
              </TabsTrigger>
              <TabsTrigger 
                value="payments"
                className="px-6 py-3 data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Payments
              </TabsTrigger>
              <TabsTrigger 
                value="planner"
                className="px-6 py-3 data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Tax Planner
              </TabsTrigger>
              <TabsTrigger 
                value="assistant"
                className="px-6 py-3 data-[state=active]:bg-background rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Tax Assistant
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="summary" className="mt-0">
                <TaxSummary analysis={analysis || defaultAnalysis} />
              </TabsContent>

              <TabsContent value="forms" className="mt-0">
                <TaxFormGenerator />
              </TabsContent>

              <TabsContent value="obligations" className="mt-0">
                <TaxObligationTracker />
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <PaymentScheduler />
              </TabsContent>

              <TabsContent value="planner" className="mt-0">
                <TaxPlanner />
              </TabsContent>

              <TabsContent value="assistant" className="mt-0">
                <TaxChat />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Tax;
