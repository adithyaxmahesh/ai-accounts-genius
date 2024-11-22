import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const AddFinancialPlanDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const [planType, setPlanType] = useState("");
  const [planData, setPlanData] = useState("");
  const { session } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('financial_planning')
        .insert({
          user_id: session?.user.id,
          plan_type: planType,
          plan_data: JSON.parse(planData || '{}'),
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial plan created successfully",
      });

      setOpen(false);
      setPlanType("");
      setPlanData("");
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create financial plan",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Financial Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Financial Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Type</label>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue placeholder="Select plan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retirement">Retirement</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="tax">Tax Planning</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Details (JSON)</label>
            <Textarea
              value={planData}
              onChange={(e) => setPlanData(e.target.value)}
              placeholder='{"goal": "Save for retirement", "targetAmount": 500000}'
              className="h-32 resize-none"
            />
          </div>
          <Button type="submit" className="w-full">Create Plan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};