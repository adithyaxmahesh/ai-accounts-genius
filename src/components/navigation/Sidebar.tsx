import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  Wallet,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <Link to={to} className="w-full">
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 hover:bg-muted"
    >
      {icon}
      <span>{label}</span>
    </Button>
  </Link>
);

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col bg-card border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="space-y-2 p-4 pt-16">
        <NavItem to="/documents" icon={<FileText className="h-4 w-4" />} label="Documents" />
        <NavItem to="/tax" icon={<Calculator className="h-4 w-4" />} label="Tax Management" />
        <NavItem to="/audit" icon={<BookOpen className="h-4 w-4" />} label="Audit Reports" />
        <NavItem to="/revenue" icon={<DollarSign className="h-4 w-4" />} label="Revenue" />
        <NavItem to="/write-offs" icon={<PieChart className="h-4 w-4" />} label="Write-Offs" />
        <NavItem to="/assurance" icon={<Shield className="h-4 w-4" />} label="Assurance" />
        <NavItem to="/forecast" icon={<TrendingUp className="h-4 w-4" />} label="Forecast" />
        
        <div className="py-2">
          <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Financial Statements</h3>
          <NavItem to="/balance-sheet" icon={<Receipt className="h-4 w-4" />} label="Balance Sheet" />
          <NavItem to="/income-statement" icon={<CreditCard className="h-4 w-4" />} label="Income Statement" />
          <NavItem to="/cash-flow" icon={<DollarSign className="h-4 w-4" />} label="Cash Flow" />
          <NavItem to="/owners-equity" icon={<Wallet className="h-4 w-4" />} label="Owner's Equity" />
        </div>
      </div>
    </div>
  );
};