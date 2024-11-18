import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { TaxSummary } from "@/components/tax-analysis/TaxSummary";
import { TaxBreakdown } from "@/components/tax-analysis/TaxBreakdown";
import { TaxPlanner } from "@/components/tax-analysis/TaxPlanner";
import { TaxDeadlines } from "@/components/tax-analysis/TaxDeadlines";
import { TaxChat } from "@/components/tax-analysis/TaxChat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const Tax = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: analysis } = useQuery({
    queryKey: ['tax-analysis', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="hover-scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <h1 className="text-3xl font-bold">Tax Management</h1>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid grid-cols-5 gap-4 bg-muted p-1">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="planner">Tax Planner</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="assistant">Tax Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <TaxSummary analysis={analysis || {}} />
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <TaxBreakdown analysis={analysis || {}} />
        </TabsContent>

        <TabsContent value="planner" className="space-y-6">
          <TaxPlanner />
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-6">
          <TaxDeadlines />
        </TabsContent>

        <TabsContent value="assistant" className="space-y-6">
          <TaxChat />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tax;