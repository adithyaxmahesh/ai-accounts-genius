import { Card } from "@/components/ui/card";
import { Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

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
  const { toast } = useToast();

  const handleAuditUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['audit', audit?.id] });
  };

  const runAIAnalysis = async () => {
    try {
      toast({
        title: "Running AI Analysis",
        description: "Analyzing audit data and risk factors...",
      });

      const { data, error } = await supabase.functions.invoke('analyze-audit-risk', {
        body: { auditId: audit?.id }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "AI risk assessment has been updated.",
      });

      handleAuditUpdate();
    } catch (error) {
      console.error('Error running AI analysis:', error);
      toast({
        title: "Error",
        description: "Failed to complete AI analysis. Please try again.",
        variant: "destructive"
      });
    }
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

  const renderAIAnalysis = () => {
    if (!audit?.automated_analysis) return null;

    return (
      <div className="bg-muted/50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Risk Analysis</h3>
          </div>
          <Button onClick={runAIAnalysis} variant="outline" size="sm">
            Refresh Analysis
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Risk Score:</span>
            <Badge variant={
              audit.automated_analysis.risk_score >= 0.7 ? "destructive" :
              audit.automated_analysis.risk_score >= 0.4 ? "warning" :
              "success"
            }>
              {(audit.automated_analysis.risk_score * 100).toFixed(0)}%
            </Badge>
          </div>

          {audit.automated_analysis.findings?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Key Findings:</h4>
              <ul className="space-y-2">
                {audit.automated_analysis.findings.map((finding: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {audit.automated_analysis.recommendations?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">AI Recommendations:</h4>
              <ul className="space-y-2">
                {audit.automated_analysis.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {audit.automated_analysis.control_evaluation && (
            <div>
              <h4 className="text-sm font-medium mb-2">Control Evaluation:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(audit.automated_analysis.control_evaluation).map(([control, status]) => (
                  <div key={control} className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">{control}</p>
                    <p className="text-sm font-medium">{status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
        {renderAIAnalysis()}
        
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
