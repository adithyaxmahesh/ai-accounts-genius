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
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const NavItem = ({ to, icon, label, isCollapsed }: NavItemProps) => (
  <Link to={to} className="w-full">
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 hover:bg-muted",
        isCollapsed && "justify-center px-2"
      )}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
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
        className="absolute right-[-12px] top-4 h-6 w-6 rounded-full border bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className={cn("space-y-2 p-4", isCollapsed ? "pt-14" : "pt-16")}>
        <NavItem to="/documents" icon={<FileText className="h-4 w-4" />} label="Documents" isCollapsed={isCollapsed} />
        <NavItem to="/tax" icon={<Calculator className="h-4 w-4" />} label="Tax Management" isCollapsed={isCollapsed} />
        <NavItem to="/audit" icon={<BookOpen className="h-4 w-4" />} label="Audit Reports" isCollapsed={isCollapsed} />
        <NavItem to="/revenue" icon={<DollarSign className="h-4 w-4" />} label="Revenue" isCollapsed={isCollapsed} />
        <NavItem to="/write-offs" icon={<PieChart className="h-4 w-4" />} label="Write-Offs" isCollapsed={isCollapsed} />
        <NavItem to="/assurance" icon={<Shield className="h-4 w-4" />} label="Assurance" isCollapsed={isCollapsed} />
        <NavItem to="/forecast" icon={<TrendingUp className="h-4 w-4" />} label="Forecast" isCollapsed={isCollapsed} />
        
        {!isCollapsed && (
          <div className="py-2">
            <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Financial Statements</h3>
          </div>
        )}
        <NavItem to="/balance-sheet" icon={<Receipt className="h-4 w-4" />} label="Balance Sheet" isCollapsed={isCollapsed} />
        <NavItem to="/income-statement" icon={<CreditCard className="h-4 w-4" />} label="Income Statement" isCollapsed={isCollapsed} />
        <NavItem to="/cash-flow" icon={<DollarSign className="h-4 w-4" />} label="Cash Flow" isCollapsed={isCollapsed} />
        <NavItem to="/owners-equity" icon={<Wallet className="h-4 w-4" />} label="Owner's Equity" isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};