import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { TaxPlanningScenario } from "@/integrations/supabase/types/tax";

export const TaxPlanner = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: scenarios, refetch } = useQuery({
    queryKey: ['tax-planning-scenarios', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_planning_scenarios')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TaxPlanningScenario[];
    }
  });

  const createScenario = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('tax_planning_scenarios')
        .insert([
          {
            name,
            description,
            user_id: session?.user.id,
            scenario_data: {}
          }
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Scenario Created",
        description: "Your tax planning scenario has been saved.",
      });
      setName("");
      setDescription("");
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create scenario. Please try again.",
        variant: "destructive",
      });
    }
  });

  const calculateImpact = useMutation({
    mutationFn: async (scenarioId: string) => {
      // Simple mock calculation - in a real app, this would be more complex
      const estimatedImpact = Math.floor(Math.random() * 50000);
      
      const { data, error } = await supabase
        .from('tax_planning_scenarios')
        .update({ estimated_tax_impact: estimatedImpact })
        .eq('id', scenarioId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Impact Calculated",
        description: "The tax impact has been calculated for this scenario.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to calculate tax impact. Please try again.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Create New Scenario</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Scenario Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Equipment Purchase"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scenario and its potential tax implications..."
            />
          </div>
          <Button 
            onClick={() => createScenario.mutate()}
            disabled={!name || createScenario.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Scenario
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios?.map((scenario) => (
          <Card key={scenario.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">{scenario.name}</h4>
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => calculateImpact.mutate(scenario.id)}
                disabled={calculateImpact.isPending}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Impact
              </Button>
            </div>
            {scenario.estimated_tax_impact && (
              <p className="text-sm mt-2">
                Estimated Tax Impact: ${scenario.estimated_tax_impact.toLocaleString()}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};