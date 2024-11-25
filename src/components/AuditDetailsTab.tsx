import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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

  const renderExecutiveSummary = () => {
    if (!audit?.description) return null;
    return (
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
        <p className="text-muted-foreground">{audit.description}</p>
      </div>
    );
  };

  const renderScopeAndObjective = () => {
    if (!audit?.audit_objective) return null;
    return (
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Audit Scope & Objective</h3>
        <p className="text-muted-foreground">{audit.audit_objective}</p>
        {audit?.stakeholders && audit.stakeholders.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Key Stakeholders</h4>
            <div className="flex flex-wrap gap-2">
              {audit.stakeholders.map((stakeholder: string, index: number) => (
                <Badge key={index} variant="outline">{stakeholder}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderControlEffectiveness = () => {
    const controls = audit?.internal_control_assessment || {};
    if (!Object.keys(controls).length) return null;

    return (
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Control Effectiveness</h3>
        <div className="space-y-4">
          {Object.entries(controls).map(([control, effectiveness]: [string, any]) => (
            <div key={control} className="flex justify-between items-center">
              <span className="text-sm font-medium">{control.replace('_', ' ').toUpperCase()}</span>
              <Badge variant={
                effectiveness === 'effective' ? 'success' :
                effectiveness === 'needs_improvement' ? 'warning' :
                'destructive'
              }>
                {effectiveness.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFindings = () => {
    if (!Array.isArray(audit?.findings) || audit.findings.length === 0) return null;

    return (
      <div className="space-y-4 mb-6">
        <TooltipProvider>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">
              Key Findings ({audit.findings.length})
            </h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Critical findings from the audit process</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <div className="space-y-4">
          {audit.findings.map((finding: any, index: number) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{finding.title || `Finding ${index + 1}`}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{finding.description}</p>
                </div>
                <Badge variant={
                  finding.severity === 'critical' ? 'destructive' :
                  finding.severity === 'major' ? 'warning' :
                  'default'
                }>
                  {finding.severity}
                </Badge>
              </div>
              {finding.impact && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Impact: </span>
                  {finding.impact}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!Array.isArray(audit?.recommendations) || audit.recommendations.length === 0) return null;

    return (
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
        <ul className="space-y-2">
          {audit.recommendations.map((rec: any, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span className="text-muted-foreground">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
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

        {renderExecutiveSummary()}
        {renderScopeAndObjective()}
        
        <RiskAssessmentMatrix auditId={audit?.id} />
        
        {renderControlEffectiveness()}
        {renderFindings()}
        {renderRecommendations()}

        <AuditItemsSection auditItems={audit?.audit_items || []} />
        <AuditTrailSection auditId={audit?.id} />
      </Card>
    </div>
  );
};

export default AuditDetailsTab;