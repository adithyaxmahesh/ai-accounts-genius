import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";

export const ManualBudgetForm = () => {
  const { session } = useAuth();
  const { toast } = useToast();
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
    <div className="space-y-4">
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
    </div>
  );
};