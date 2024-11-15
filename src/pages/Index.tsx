import { useAuth } from "@/components/AuthProvider";
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BusinessIntelligence />
        <AiInsights />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <FraudDetection />
        <DocumentUpload />
      </div>
    </div>
  );
};

export default Index;