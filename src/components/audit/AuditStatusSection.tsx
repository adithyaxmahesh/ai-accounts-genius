import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateAuditStatus } from "@/utils/auditUtils";
import AuditProgress from "./AuditProgress";

interface AuditStatusSectionProps {
  audit: any;
  getStatusExplanation: (status: string) => string;
  onUpdate: () => void;
}

const AuditStatusSection = ({ audit, getStatusExplanation, onUpdate }: AuditStatusSectionProps) => {
  const { toast } = useToast();

  const handleProgressAudit = async () => {
    try {
      const nextStatus = {
        'planning': 'control_evaluation',
        'control_evaluation': 'evidence_gathering',
        'evidence_gathering': 'review',
        'review': 'completed'
      }[audit.status];

      if (!nextStatus) {
        toast({
          title: "Info",
          description: "Audit is already completed",
        });
        return;
      }

      await updateAuditStatus(audit.id, nextStatus);
      onUpdate();
      
      toast({
        title: "Success",
        description: `Moved to ${nextStatus.replace('_', ' ')} phase`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update audit status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-6">
      <AuditProgress 
        status={audit?.status} 
        getStatusExplanation={getStatusExplanation} 
      />
      
      {audit?.status !== 'completed' && (
        <div className="mt-4">
          <Button onClick={handleProgressAudit} className="w-full">
            Progress to Next Phase
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuditStatusSection;