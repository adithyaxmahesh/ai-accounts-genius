import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  DollarSign,
  Calculator,
  ClipboardList,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { QueryInterface } from "@/components/QueryInterface";
import { AiInsights } from "@/components/AiInsights";

const Index = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Audit Reports",
      icon: <FileText className="h-6 w-6" />,
      description: "View and manage audit reports",
      path: "/audit",
      color: "text-blue-500",
    },
    {
      title: "Revenue Analysis",
      icon: <TrendingUp className="h-6 w-6" />,
      description: "Track and analyze revenue",
      path: "/revenue",
      color: "text-green-500",
    },
    {
      title: "Financial Forecast",
      icon: <DollarSign className="h-6 w-6" />,
      description: "AI-powered financial projections",
      path: "/forecast",
      color: "text-purple-500",
    },
    {
      title: "Write-Offs",
      icon: <Calculator className="h-6 w-6" />,
      description: "Manage tax write-offs",
      path: "/write-offs",
      color: "text-red-500",
    },
    {
      title: "Documents",
      icon: <ClipboardList className="h-6 w-6" />,
      description: "Upload and process documents",
      path: "/documents",
      color: "text-orange-500",
    },
    {
      title: "Balance Sheet",
      icon: <FileCheck className="h-6 w-6" />,
      description: "View balance sheet",
      path: "/balance-sheet",
      color: "text-teal-500",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your AI-powered accounting assistant
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueryInterface />
        <AiInsights />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card
            key={item.path}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer glass-card"
            onClick={() => navigate(item.path)}
          >
            <div className="flex justify-between items-start">
              <div className={item.color}>{item.icon}</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mt-4">{item.title}</h2>
            <p className="text-muted-foreground mt-2">{item.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
