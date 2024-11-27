import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AssuranceEngagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const AssuranceEngagementDialog = ({
  isOpen,
  onOpenChange,
  userId,
}: AssuranceEngagementDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    clientName: "",
    engagementType: "",
    startDate: "",
    objective: "",
    scope: "",
    materialityThreshold: "",
  });

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("assurance_engagements").insert({
        client_name: formData.clientName,
        engagement_type: formData.engagementType,
        start_date: formData.startDate,
        user_id: userId,
        status: "planning",
        objective: formData.objective,
        scope: formData.scope,
        materiality_threshold: parseFloat(formData.materialityThreshold) || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assurance engagement created successfully.",
      });

      onOpenChange(false);
      setFormData({
        clientName: "",
        engagementType: "",
        startDate: "",
        objective: "",
        scope: "",
        materialityThreshold: "",
      });
    } catch (error) {
      console.error("Error creating engagement:", error);
      toast({
        title: "Error",
        description: "Failed to create assurance engagement.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Assurance Engagement</DialogTitle>
          <DialogDescription>
            Create a new assurance engagement for your client. This will start the assurance process including planning, evidence gathering, evaluation, and reporting phases.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Client Name</label>
            <Input
              value={formData.clientName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, clientName: e.target.value }))
              }
              placeholder="Enter the client organization name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Engagement Type</label>
            <Select
              value={formData.engagementType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, engagementType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial_audit">Financial Statement Audit</SelectItem>
                <SelectItem value="compliance">Compliance Review</SelectItem>
                <SelectItem value="internal_control">Internal Control Review</SelectItem>
                <SelectItem value="performance">Performance Assessment</SelectItem>
                <SelectItem value="operational">Operational Review</SelectItem>
                <SelectItem value="sustainability">Sustainability Assurance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Engagement Objective</label>
            <Textarea
              value={formData.objective}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, objective: e.target.value }))
              }
              placeholder="Define the purpose and objectives of this assurance engagement"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Engagement Scope</label>
            <Textarea
              value={formData.scope}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scope: e.target.value }))
              }
              placeholder="Define the boundaries and scope of the assurance engagement"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Materiality Threshold</label>
            <Input
              type="number"
              value={formData.materialityThreshold}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, materialityThreshold: e.target.value }))
              }
              placeholder="Enter the materiality threshold amount"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!formData.clientName || !formData.engagementType || !formData.startDate}
          >
            Create Engagement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};