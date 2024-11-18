import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaxSummaryTab from "@/components/TaxSummaryTab";
import AuditDetailsTab from "@/components/AuditDetailsTab";
import { getStatusExplanation, getRiskLevelExplanation } from "@/utils/auditUtils";

interface AuditDetailTabsProps {
  audit: any;
}

const AuditDetailTabs = ({ audit }: AuditDetailTabsProps) => {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList>
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
  );
};

export default AuditDetailTabs;