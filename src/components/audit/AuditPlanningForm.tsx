import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuditPlanningFormProps {
  auditId: string;
  onComplete: () => void;
}

const AuditPlanningForm = ({ auditId, onComplete }: AuditPlanningFormProps) => {
  const { toast } = useToast();
  const [objective, setObjective] = useState("");
  const [stakeholders, setStakeholders] = useState("");
  const [materialityThreshold, setMaterialityThreshold] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("audit_reports")
        .update({
          audit_objective: objective,
          stakeholders: stakeholders.split(",").map(s => s.trim()),
          materiality_threshold: parseFloat(materialityThreshold),
          engagement_letter: {
            date: new Date().toISOString(),
            objective: objective,
            scope: "Financial Statement Audit",
            methodology: "In accordance with International Standards on Auditing"
          },
          status: "control_evaluation"
        })
        .eq("id", auditId);

      if (error) throw error;

      toast({
        title: "Audit Planning Complete",
        description: "Moving to Control Evaluation phase"
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update audit plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Audit Objective
          </label>
          <Textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Define the primary objective of this audit..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Stakeholders (comma-separated)
          </label>
          <Input
            value={stakeholders}
            onChange={(e) => setStakeholders(e.target.value)}
            placeholder="Investors, Board Members, Regulators..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Materiality Threshold ($)
          </label>
          <Input
            type="number"
            value={materialityThreshold}
            onChange={(e) => setMaterialityThreshold(e.target.value)}
            placeholder="Enter threshold amount..."
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Complete Planning Phase"}
        </Button>
      </form>
    </Card>
  );
};

export default AuditPlanningForm;