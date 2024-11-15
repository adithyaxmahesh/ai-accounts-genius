import { useAuth } from "@/components/AuthProvider";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { TransactionList } from "@/components/TransactionList";
import { BusinessIntelligence } from "@/components/business-intelligence/BusinessIntelligence";
import { AiInsights } from "@/components/ai-insights/AiInsights";
import { FraudDetection } from "@/components/fraud-detection/FraudDetection";
import { DocumentUpload } from "@/components/document-management/DocumentUpload";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="min-h-screen">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto py-2">
          <Tabs defaultValue="dashboard">
            <TabsList className="w-full justify-start h-16 bg-primary/5">
              <TabsTrigger 
                value="dashboard" 
                className="gap-2 text-lg px-8 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BarChart className="h-6 w-6" />
                Dashboard
              </TabsTrigger>
              {navigationItems.map((item) => (
                <TabsTrigger
                  key={item.path}
                  value={item.path}
                  className="gap-2 text-lg px-8 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-6 w-6" />
                  {item.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BusinessIntelligence />
          <AiInsights />
          <FraudDetection />
          <FinancialMetrics />
          <TransactionList />
          <DocumentUpload className="scale-95" />
        </div>
      </div>
    </div>
  );
};

export default Index;