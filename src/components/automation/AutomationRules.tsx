import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

export const AutomationRules = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [showAddRule, setShowAddRule] = useState(false);

  const { data: rules } = useQuery({
    queryKey: ['automation-rules', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Rule Updated",
        description: `Rule has been ${!isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Automation Rules</h2>
        </div>
        <Button onClick={() => setShowAddRule(true)} className="hover-scale">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {rules?.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">{rule.name}</h3>
              <p className="text-sm text-muted-foreground">{rule.description}</p>
            </div>
            <Switch
              checked={rule.is_active}
              onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
            />
          </div>
        ))}

        {!rules?.length && (
          <div className="text-center text-muted-foreground py-8">
            No automation rules set up yet
          </div>
        )}
      </div>
    </Card>
  );
};