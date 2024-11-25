import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuditControlEvaluationProps {
  auditId: string;
  onComplete: () => void;
}

const AuditControlEvaluation = ({ auditId, onComplete }: AuditControlEvaluationProps) => {
  const { toast } = useToast();
  const [controlAssessment, setControlAssessment] = useState("");
  const [controlEffectiveness, setControlEffectiveness] = useState("effective");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("audit_reports")
        .update({
          internal_control_assessment: {
            assessment: controlAssessment,
            effectiveness: controlEffectiveness,
            date: new Date().toISOString()
          },
          status: "evidence_gathering"
        })
        .eq("id", auditId);

      if (error) throw error;

      toast({
        title: "Control Evaluation Complete",
        description: "Moving to Evidence Gathering phase"
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update control evaluation",
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
            Control Assessment
          </label>
          <Textarea
            value={controlAssessment}
            onChange={(e) => setControlAssessment(e.target.value)}
            placeholder="Describe the internal control evaluation..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Control Effectiveness
          </label>
          <Select
            value={controlEffectiveness}
            onValueChange={setControlEffectiveness}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="effective">Effective</SelectItem>
              <SelectItem value="partially_effective">Partially Effective</SelectItem>
              <SelectItem value="ineffective">Ineffective</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Complete Control Evaluation"}
        </Button>
      </form>
    </Card>
  );
};

export default AuditControlEvaluation;