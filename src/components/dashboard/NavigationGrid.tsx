import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  DollarSign, 
  Calculator, 
  Shield, 
  BookOpen, 
  PieChart, 
  FileSpreadsheet, 
  TrendingUp,
  Receipt,
  CreditCard,
  Wallet
} from "lucide-react";

export const NavigationGrid = () => {
  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
      <Link to="/documents" className="group">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload and manage your tax documents and receipts.
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/tax" className="group">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-primary" />
              <span>Tax Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Calculate taxes, track deadlines, and plan your tax strategy.
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/audit" className="group">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Audit Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and manage audit reports and findings.
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/revenue" className="group">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span>Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track and analyze your revenue streams.
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/write-offs" className="group">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-primary" />
              <span>Write-Offs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage your business expenses and deductions.
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/assurance" className="group">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Assurance Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage assurance engagements and access learning materials for CPA certification.
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/forecast" className="group">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Forecast</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Predict future revenue and tax obligations.
            </p>
          </CardContent>
        </Card>
      </Link>

      <div className="group">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <span>Financial Statements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/balance-sheet" className="block p-2 hover:bg-muted rounded-md">
              <div className="flex items-center space-x-2">
                <Receipt className="h-4 w-4" />
                <span>Balance Sheet</span>
              </div>
            </Link>
            <Link to="/income-statement" className="block p-2 hover:bg-muted rounded-md">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Income Statement</span>
              </div>
            </Link>
            <Link to="/cash-flow" className="block p-2 hover:bg-muted rounded-md">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Cash Flow</span>
              </div>
            </Link>
            <Link to="/owners-equity" className="block p-2 hover:bg-muted rounded-md">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>Owner's Equity</span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
