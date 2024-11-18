import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import TaxSummaryTab from "@/components/TaxSummaryTab";
import AuditDetailsTab from "@/components/AuditDetailsTab";
import { getStatusExplanation, getRiskLevelExplanation } from "@/utils/auditUtils";

interface AuditDetailTabsProps {
  audit: any;
}

const AuditDetailTabs = ({ audit }: AuditDetailTabsProps) => {
  if (!audit) {
    console.error('No audit data provided to AuditDetailTabs');
    return null;
  }

  return (
    <TooltipProvider>
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Audit Details</TabsTrigger>
          <TabsTrigger value="tax">Tax Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <AuditDetailsTab 
            audit={audit}
            getStatusExplanation={getStatusExplanation}
            getRiskLevelExplanation={getRiskLevelExplanation}
          />
        </TabsContent>
        <TabsContent value="tax">
          <TaxSummaryTab audit={audit} />
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
};

export default AuditDetailTabs;