import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, FileText, AlertTriangle, Check, ClipboardList } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import AuditFindings from "@/components/audit/AuditFindings";
import AuditProgress from "@/components/audit/AuditProgress";
import AuditItemsSection from "@/components/audit/AuditItemsSection";
import { updateAuditStatus } from "@/utils/auditUtils";

interface AuditDetailsProps {
  audit: any;
  getStatusExplanation: (status: string) => string;
  getRiskLevelExplanation: (level: string) => string;
}

const AuditDetailsTab = ({ audit, getStatusExplanation, getRiskLevelExplanation }: AuditDetailsProps) => {
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

  const getAuditHealthStatus = () => {
    const flaggedItems = audit?.audit_items?.filter(item => item.status === 'flagged') || [];
    const totalItems = audit?.audit_items?.length || 0;
    
    if (totalItems === 0) return { status: 'pending', message: 'No items to review' };
    if (flaggedItems.length === 0) return { status: 'good', message: 'No issues found' };
    if (flaggedItems.length / totalItems < 0.2) return { status: 'warning', message: 'Minor issues found' };
    return { status: 'bad', message: 'Significant issues found' };
  };

  const healthStatus = getAuditHealthStatus();

  return (
    <Card className="p-6 glass-card">
      <div className="flex justify-between items-start mb-6">
        <AuditProgress 
          status={audit?.status} 
          getStatusExplanation={getStatusExplanation} 
        />
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Risk Level</p>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getRiskLevelExplanation(audit?.risk_level)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-1 flex items-center">
              {audit?.risk_level === 'high' ? (
                <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
              ) : audit?.status === 'completed' ? (
                <Check className="h-4 w-4 text-green-500 mr-1" />
              ) : null}
              {audit?.risk_level}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Audit Health</p>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Overall assessment based on findings and flagged items</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Badge 
              variant={
                healthStatus.status === 'good' ? 'success' :
                healthStatus.status === 'warning' ? 'warning' :
                healthStatus.status === 'bad' ? 'destructive' :
                'secondary'
              }
              className="mt-1"
            >
              {healthStatus.message}
            </Badge>
          </div>
        </div>
      </div>

      {audit?.status !== 'completed' && (
        <div className="mb-6">
          <Button onClick={handleProgressAudit} className="w-full">
            Progress to Next Phase
          </Button>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">Findings ({Array.isArray(audit?.findings) ? audit.findings.length : 0})</h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Detailed findings from the audit process</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-4">
            {Array.isArray(audit?.findings) && audit.findings.map((finding, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{finding}</p>
              </div>
            ))}
            {(!Array.isArray(audit?.findings) || audit.findings.length === 0) && (
              <p className="text-muted-foreground text-center py-4">
                No findings recorded yet
              </p>
            )}
          </div>
        </div>

        <AuditItemsSection auditItems={audit?.audit_items || []} />

        {Array.isArray(audit?.recommendations) && audit.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">
                Recommendations ({audit.recommendations.length})
              </h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Suggested actions to address findings</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              {audit.recommendations.map((rec, index) => (
                <li key={index} className="text-muted-foreground">{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AuditDetailsTab;