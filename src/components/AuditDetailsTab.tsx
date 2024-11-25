import { Card } from "@/components/ui/card";
import AuditStatusSection from "@/components/audit/AuditStatusSection";
import AuditHealthSection from "@/components/audit/AuditHealthSection";
import RiskAssessmentMatrix from "@/components/audit/RiskAssessmentMatrix";
import AuditItemsSection from "@/components/audit/AuditItemsSection";
import AuditTrailSection from "@/components/audit/AuditTrailSection";
import AuditExecutiveSummary from "@/components/audit/AuditExecutiveSummary";
import AuditAIAnalysis from "@/components/audit/AuditAIAnalysis";

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
  const handleAuditUpdate = () => {
    // Trigger a refetch of the audit data
    window.location.reload();
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

        <AuditExecutiveSummary 
          description={audit?.description}
          audit_objective={audit?.audit_objective}
          stakeholders={audit?.stakeholders}
        />

        <AuditAIAnalysis 
          audit={audit}
          onUpdate={handleAuditUpdate}
        />
        
        <RiskAssessmentMatrix auditId={audit?.id} />
        
        <AuditItemsSection auditItems={audit?.audit_items || []} />
        <AuditTrailSection auditId={audit?.id} />
      </Card>
    </div>
  );
};

export default AuditDetailsTab;