import { useAuth } from "@/components/AuthProvider";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { TransactionList } from "@/components/TransactionList";
import { BusinessIntelligence } from "@/components/business-intelligence/BusinessIntelligence";
import { AiInsights } from "@/components/ai-insights/AiInsights";
import { FraudDetection } from "@/components/fraud-detection/FraudDetection";
import { DocumentUpload } from "@/components/document-management/DocumentUpload";

const Index = () => {
  const { session } = useAuth();

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BusinessIntelligence />
        <AiInsights />
        <FraudDetection />
        <FinancialMetrics />
        <TransactionList />
        <DocumentUpload />
      </div>
    </div>
  );
};

export default Index;