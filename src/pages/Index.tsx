import { Card } from "@/components/ui/card";
import { OpenAITest } from "@/components/OpenAITest";
import { QueryInterface } from "@/components/QueryInterface";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  PiggyBank,
  DollarSign,
  ClipboardList,
  Calculator,
  TrendingUp,
  Scale,
  LineChart,
  ArrowUpDown,
  BookOpen,
  Gauge
} from "lucide-react";

export default function Index() {
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Tax Assistant</h1>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  const menuItems = [
    { title: "Write-Offs", icon: PiggyBank, path: "/write-offs" },
    { title: "Documents", icon: FileText, path: "/documents" },
    { title: "Tax", icon: Calculator, path: "/tax" },
    { title: "Revenue", icon: DollarSign, path: "/revenue" },
    { title: "Balance Sheet", icon: Scale, path: "/balance-sheet" },
    { title: "Cash Flow", icon: TrendingUp, path: "/cash-flow" },
    { title: "Income Statement", icon: BarChart3, path: "/income-statement" },
    { title: "Owner's Equity", icon: ClipboardList, path: "/owners-equity" },
    { title: "Financial Statements", icon: LineChart, path: "/financial-statements" },
    { title: "Forecast", icon: TrendingUp, path: "/forecast" },
    { title: "Audit", icon: Gauge, path: "/audit" },
    { title: "Assurance", icon: BookOpen, path: "/assurance" },
    { title: "Expenses", icon: ArrowUpDown, path: "/expenses" }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <Card 
            key={item.path}
            className="p-4 hover:bg-accent cursor-pointer transition-colors"
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{item.title}</span>
            </div>
          </Card>
        ))}
      </div>

      <QueryInterface />
      
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">OpenAI Connection Test</h2>
        <OpenAITest />
      </Card>
    </div>
  );
}