import { FinancialMetrics } from "@/components/FinancialMetrics";
import { BusinessIntelligence } from "@/components/business-intelligence/BusinessIntelligence";
import { FinancialHealthMetrics } from "@/components/dashboard/FinancialHealthMetrics";
import { AutomationRules } from "@/components/automation/AutomationRules";
import { DocumentUpload } from "@/components/document-management/DocumentUpload";

const Index = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Financial Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialMetrics />
        <FinancialHealthMetrics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BusinessIntelligence />
        <AutomationRules />
      </div>

      <DocumentUpload />
    </div>
  );
};

export default Index;