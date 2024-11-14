import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Upload, DollarSign, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { TransactionList } from "@/components/TransactionList";
import { DocumentUpload } from "@/components/DocumentUpload";
import { FraudDetection } from "@/components/FraudDetection";
import { useNavigate } from "react-router-dom";

const data = [
  { name: "Jan", amount: 4000 },
  { name: "Feb", amount: 3000 },
  { name: "Mar", amount: 2000 },
  { name: "Apr", amount: 2780 },
  { name: "May", amount: 1890 },
  { name: "Jun", amount: 2390 },
];

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleMetricClick = (metric: string) => {
    toast({
      title: `Viewing ${metric} Details`,
      description: `Navigating to detailed view of ${metric}...`,
    });
    // You can add specific navigation logic here based on the metric
    if (metric === "Risk Score") {
      navigate("/audit");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 fade-in">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI Financial Assistant</h1>
          <p className="text-muted-foreground">Your intelligent accounting partner</p>
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => navigate("/audit")}
            variant="outline"
            className="hover-scale"
          >
            <FileText className="mr-2 h-4 w-4" />
            Audits
          </Button>
          <Button
            onClick={() => {
              toast({
                title: "AI Analysis Started",
                description: "Processing your financial data...",
              });
            }}
            className="hover-scale"
          >
            Run AI Analysis
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="glass-card p-6 hover-scale cursor-pointer" 
          onClick={() => handleMetricClick("Revenue")}
        >
          <DollarSign className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-3xl font-bold">$84,234.00</p>
          <p className="text-sm text-muted-foreground">+12.5% from last month</p>
        </Card>
        <Card 
          className="glass-card p-6 hover-scale cursor-pointer" 
          onClick={() => handleMetricClick("Risk Score")}
        >
          <AlertTriangle className="h-8 w-8 mb-4 text-destructive" />
          <h3 className="text-lg font-semibold">Risk Score</h3>
          <p className="text-3xl font-bold">Low</p>
          <p className="text-sm text-muted-foreground">2 items flagged</p>
        </Card>
        <Card 
          className="glass-card p-6 hover-scale cursor-pointer" 
          onClick={() => handleMetricClick("Forecast")}
        >
          <TrendingUp className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Forecast</h3>
          <p className="text-3xl font-bold">+8.3%</p>
          <p className="text-sm text-muted-foreground">Next quarter growth</p>
        </Card>
        <Card 
          className="glass-card p-6 hover-scale cursor-pointer" 
          onClick={() => handleMetricClick("Documents")}
        >
          <FileText className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Documents</h3>
          <p className="text-3xl font-bold">143</p>
          <p className="text-sm text-muted-foreground">Processed this month</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">Revenue Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#9b87f5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">Expense Optimization</h4>
              <p className="text-sm text-muted-foreground">
                AI analysis suggests potential savings of $2,345 in operational costs
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">Cash Flow Prediction</h4>
              <p className="text-sm text-muted-foreground">
                Based on current trends, expect 15% increase in Q3
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">Tax Optimization</h4>
              <p className="text-sm text-muted-foreground">
                3 potential deductions identified worth $5,678
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Recent Audits</h3>
          <Button 
            variant="outline" 
            className="hover-scale"
            onClick={() => navigate("/audit")}
          >
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="flex justify-between items-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => navigate(`/audit/${i}`)}
            >
              <div>
                <p className="font-semibold">Audit Report #{i}</p>
                <p className="text-sm text-muted-foreground">Status: In Progress</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">3 Findings</p>
                <p className="text-sm text-muted-foreground">Mar 15, 2024</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Document Processing</h3>
          <Button className="hover-scale">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">Invoice #{i}</p>
              <p className="text-sm text-muted-foreground">Status: Processed</p>
              <p className="text-sm text-muted-foreground">Confidence: 98%</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Index;