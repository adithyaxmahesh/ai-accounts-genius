import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, FileText, AlertTriangle, Check, ClipboardList, Shield, Search, FileCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import AuditItemCard from "@/components/AuditItemCard";
import { updateAuditStatus } from "@/utils/auditUtils";

interface AuditDetailsProps {
  audit: any;
  getStatusExplanation: (status: string) => string;
  getRiskLevelExplanation: (level: string) => string;
}

const AuditDetailsTab = ({ audit, getStatusExplanation, getRiskLevelExplanation }: AuditDetailsProps) => {
  const { toast } = useToast();

  const getAuditProgress = (status: string) => {
    const stages = ['planning', 'control_evaluation', 'evidence_gathering', 'review', 'completed'];
    const currentIndex = stages.indexOf(status);
    return Math.round(((currentIndex + 1) / stages.length) * 100);
  };

  const getAuditAccomplishments = (status: string) => {
    switch (status) {
      case 'planning':
        return "Initial audit scope defined and risk areas identified";
      case 'control_evaluation':
        return "Internal controls assessed and test procedures established";
      case 'evidence_gathering':
        return "Financial documents analyzed and evidence collected";
      case 'review':
        return "Findings compiled and recommendations drafted";
      case 'completed':
        return "Full audit completed with detailed findings and recommendations";
      default:
        return "Audit not yet started";
    }
  };

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

  return (
    <Card className="p-6 glass-card">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Current Phase</p>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{getStatusExplanation(audit?.status)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className={`mt-1 px-3 py-1 rounded-full text-sm inline-block ${
            audit?.status === 'completed' ? 'bg-green-100 text-green-800' :
            audit?.status === 'review' ? 'bg-orange-100 text-orange-800' :
            audit?.status === 'evidence_gathering' ? 'bg-purple-100 text-purple-800' :
            audit?.status === 'control_evaluation' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {audit?.status?.replace('_', ' ')}
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium">Progress: {getAuditProgress(audit?.status)}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {getAuditAccomplishments(audit?.status)}
            </p>
          </div>
        </div>
        
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
            <h3 className="text-lg font-semibold">Description</h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Detailed explanation of the audit's purpose and scope</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-muted-foreground">{audit?.description}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">Audit Items</h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Individual transactions or records being reviewed</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-4">
            {audit?.audit_items?.map((item) => (
              <AuditItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {audit?.recommendations?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">Recommendations</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Suggested actions to address findings and improve processes</p>
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

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">Audit Timeline</h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Key dates and milestones in the audit process</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Created:</span>{" "}
              {new Date(audit?.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Last Updated:</span>{" "}
              {new Date(audit?.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AuditDetailsTab;
