import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaxSummaryTab from "@/components/TaxSummaryTab";
import { TaxFormGenerator } from "@/components/tax-forms/TaxFormGenerator";

export const TaxSummary = ({ analysis }: { analysis: any }) => {
  return (
    <Tabs defaultValue="summary" className="space-y-4">
      <TabsList>
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="forms">Tax Forms</TabsTrigger>
      </TabsList>
      
      <TabsContent value="summary">
        <TaxSummaryTab audit={analysis} />
      </TabsContent>
      
      <TabsContent value="forms">
        <TaxFormGenerator />
      </TabsContent>
    </Tabs>
  );
};