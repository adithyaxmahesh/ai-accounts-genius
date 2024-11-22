import { Card } from "@/components/ui/card";
import { Cog, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const AutomationRules = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    ruleType: "expense",
    conditions: {},
    actions: {}
  });

  const { data: rules, refetch } = useQuery({
    queryKey: ['automation-rules', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', session?.user.id);
      
      if (error) throw error;
      return data;
    }
  });

  const handleCreateRule = async () => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .insert({
          user_id: session?.user.id,
          name: newRule.name,
          description: newRule.description,
          rule_type: newRule.ruleType,
          conditions: newRule.conditions,
          actions: newRule.actions
        });

      if (error) throw error;

      toast({
        title: "Rule created",
        description: "New automation rule has been created",
      });

      setNewRule({
        name: "",
        description: "",
        ruleType: "expense",
        conditions: {},
        actions: {}
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create automation rule",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cog className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Automation Rules</h2>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newRule.description}
                  onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="ruleType">Rule Type</Label>
                <select
                  id="ruleType"
                  value={newRule.ruleType}
                  onChange={(e) => setNewRule(prev => ({ ...prev, ruleType: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <Button onClick={handleCreateRule} className="w-full">
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {rules?.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-4 bg-muted rounded-lg"
          >
            <div>
              <h3 className="font-medium">{rule.name}</h3>
              <p className="text-sm text-muted-foreground">{rule.description}</p>
            </div>
            <Switch
              checked={rule.is_active}
              onCheckedChange={async (checked) => {
                await supabase
                  .from('automation_rules')
                  .update({ is_active: checked })
                  .eq('id', rule.id);
                refetch();
              }}
            />
          </div>
        ))}

        {!rules?.length && (
          <div className="text-center text-muted-foreground">
            No automation rules created
          </div>
        )}
      </div>
    </Card>
  );
};