import { useAuth } from "@/components/AuthProvider";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { TransactionList } from "@/components/TransactionList";
import { BusinessIntelligence } from "@/components/business-intelligence/BusinessIntelligence";
import { AiInsights } from "@/components/ai-insights/AiInsights";
import { FraudDetection } from "@/components/fraud-detection/FraudDetection";
import { DocumentUpload } from "@/components/document-management/DocumentUpload";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  FileText, 
  Calculator, 
  TrendingUp, 
  Receipt, 
  FileSpreadsheet 
} from "lucide-react";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    return null;
  }

  const navigationItems = [
    { title: "Revenue", icon: BarChart, path: "/revenue" },
    { title: "Audit", icon: Calculator, path: "/audit" },
    { title: "Forecast", icon: TrendingUp, path: "/forecast" },
    { title: "Write-Offs", icon: Receipt, path: "/write-offs" },
    { title: "Documents", icon: FileText, path: "/documents" },
    { title: "Balance Sheet", icon: FileSpreadsheet, path: "/balance-sheet" }
  ];

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

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;