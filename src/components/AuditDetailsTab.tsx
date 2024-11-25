import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import AuditStatusSection from "@/components/audit/AuditStatusSection";
import AuditHealthSection from "@/components/audit/AuditHealthSection";
import RiskAssessmentMatrix from "@/components/audit/RiskAssessmentMatrix";
import AuditItemsSection from "@/components/audit/AuditItemsSection";
import AuditTrailSection from "@/components/audit/AuditTrailSection";
import AuditPlanningForm from "@/components/audit/AuditPlanningForm";
import AuditControlEvaluation from "@/components/audit/AuditControlEvaluation";
import { useQueryClient } from "@tanstack/react-query";

interface AuditDetailsProps {
  audit: any;
  getStatusExplanation: (status: string) => string;
  getRiskLevelExplanation: (level: string) => string;
}

const AuditDetailsTab = ({ 
  audit, 
  getStatusExplanation, 
  getRiskLevelExplanation 
}: AuditDetailsProps) => {
  const queryClient = useQueryClient();

  const handleAuditUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['audit', audit?.id] });
  };

  const renderAuditPhase = () => {
    switch (audit?.status) {
      case 'planning':
        return (
          <AuditPlanningForm 
            auditId={audit.id} 
            onComplete={handleAuditUpdate} 
          />
        );
      case 'control_evaluation':
        return (
          <AuditControlEvaluation 
            auditId={audit.id} 
            onComplete={handleAuditUpdate} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 glass-card">
        <div className="flex justify-between items-start mb-6">
          <AuditStatusSection 
            audit={audit}
            getStatusExplanation={getStatusExplanation}
            onUpdate={handleAuditUpdate}
          />
          
          <AuditHealthSection 
            audit={audit}
            getRiskLevelExplanation={getRiskLevelExplanation}
          />
        </div>

        {renderAuditPhase()}

        <div className="space-y-6 mt-6">
          <RiskAssessmentMatrix auditId={audit?.id} />

          {audit?.audit_objective && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Audit Objective</h3>
              <p className="text-muted-foreground">{audit.audit_objective}</p>
            </div>
          )}

          <div>
            <TooltipProvider>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">
                  Findings ({Array.isArray(audit?.findings) ? audit.findings.length : 0})
                </h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Detailed findings from the audit process</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <div className="space-y-4">
              {Array.isArray(audit?.findings) && audit.findings.map((finding: string, index: number) => (
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
              <TooltipProvider>
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
              </TooltipProvider>
              <ul className="list-disc pl-5 space-y-2">
                {audit.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <AuditTrailSection auditId={audit?.id} />
        </div>
      </Card>
    </div>
  );
};

export default AuditDetailsTab;