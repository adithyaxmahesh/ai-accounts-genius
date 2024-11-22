import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  });

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("assurance_engagements").insert({
        client_name: formData.clientName,
        engagement_type: formData.engagementType,
        start_date: formData.startDate,
        user_id: userId,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Assurance Engagement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Client Name</label>
            <Input
              value={formData.clientName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, clientName: e.target.value }))
              }
              placeholder="Enter client name"
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
                <SelectItem value="financial_audit">Financial Audit</SelectItem>
                <SelectItem value="compliance">Compliance Review</SelectItem>
                <SelectItem value="internal_control">Internal Control Review</SelectItem>
                <SelectItem value="performance">Performance Assessment</SelectItem>
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