import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditItemsSection } from "./AuditItemsSection";
import { AuditHealthSection } from "./AuditHealthSection";
import { AuditStatusSection } from "./AuditStatusSection";
import { AuditTrailSection } from "./AuditTrailSection";
import { AutomatedAuditSection } from "./AutomatedAuditSection";
import { AutomatedAuditResults } from "./AutomatedAuditResults";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuditDetailTabsProps {
  auditId: string;
  onStatusChange?: () => void;
}

export const AuditDetailTabs = ({ auditId, onStatusChange }: AuditDetailTabsProps) => {
  const { data: automatedResults } = useQuery({
    queryKey: ['audit-automated-results', auditId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_reports')
        .select('automated_analysis, risk_scores, control_effectiveness, anomaly_detection')
        .eq('id', auditId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="items">Audit Items</TabsTrigger>
        <TabsTrigger value="automated">Automated Analysis</TabsTrigger>
        <TabsTrigger value="trail">Audit Trail</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-4 md:grid-cols-2">
          <AuditHealthSection auditId={auditId} />
          <AuditStatusSection 
            auditId={auditId} 
            onStatusChange={onStatusChange}
          />
        </div>
      </TabsContent>

      <TabsContent value="items">
        <AuditItemsSection auditId={auditId} />
      </TabsContent>

      <TabsContent value="automated">
        <div className="space-y-6">
          <AutomatedAuditSection 
            auditId={auditId}
            onComplete={onStatusChange}
          />
          {automatedResults?.automated_analysis && (
            <AutomatedAuditResults 
              results={{
                riskScores: automatedResults.risk_scores,
                controlEffectiveness: automatedResults.control_effectiveness,
                anomaly_detection: automatedResults.anomaly_detection
              }}
            />
          )}
        </div>
      </TabsContent>

      <TabsContent value="trail">
        <AuditTrailSection auditId={auditId} />
      </TabsContent>
    </Tabs>
  );
};