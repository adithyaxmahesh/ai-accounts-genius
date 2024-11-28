import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BalanceSheetFormFieldsProps {
  name: string;
  setName: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  subcategory: string;
  setSubcategory: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedTab: string;
  isTracking: boolean;
  setIsTracking: (value: boolean) => void;
}

export const ASSET_SUBCATEGORIES = [
  { value: "cash", label: "Cash & Bank", help: "Affects Current Ratio & Cash Flow" },
  { value: "credit_cards", label: "Credit Cards", help: "Affects Cash Flow" },
  { value: "investments", label: "Investments", help: "Affects Health Score" },
  { value: "receivables", label: "Accounts Receivable", help: "Affects Current Ratio" },
  { value: "inventory", label: "Inventory", help: "Affects Current Ratio" },
  { value: "equipment", label: "Equipment & Property", help: "Long-term Asset" },
];

export const LIABILITY_SUBCATEGORIES = [
  { value: "loans", label: "Loans & Mortgages", help: "Affects Debt Ratio" },
  { value: "credit_card_debt", label: "Credit Card Debt", help: "Affects Debt Ratio & Current Ratio" },
  { value: "payables", label: "Accounts Payable", help: "Affects Current Ratio" },
  { value: "taxes", label: "Tax Liabilities", help: "Affects Debt Ratio" },
];

export const EQUITY_SUBCATEGORIES = [
  { value: "retained", label: "Retained Earnings", help: "Owner's Equity" },
  { value: "capital", label: "Owner's Capital", help: "Initial Investment" },
];

export const BalanceSheetFormFields = ({
  name,
  setName,
  amount,
  setAmount,
  subcategory,
  setSubcategory,
  description,
  setDescription,
  selectedTab,
  isTracking,
  setIsTracking,
}: BalanceSheetFormFieldsProps) => {
  const getSubcategories = () => {
    switch (selectedTab) {
      case "asset":
        return ASSET_SUBCATEGORIES;
      case "liability":
        return LIABILITY_SUBCATEGORIES;
      case "equity":
        return EQUITY_SUBCATEGORIES;
      default:
        return [];
    }
  };

  return (
    <>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-background"
        />
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="bg-background"
        />
      </div>
      <div>
        <Label htmlFor="subcategory" className="flex items-center gap-2">
          Subcategory
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose a category to see how it affects your financial metrics</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Select 
          value={subcategory} 
          onValueChange={setSubcategory}
          required
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select subcategory" />
          </SelectTrigger>
          <SelectContent>
            {getSubcategories().map((sub) => (
              <SelectItem key={sub.value} value={sub.value} className="relative">
                {sub.label}
                <span className="text-xs text-muted-foreground ml-2">({sub.help})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {(subcategory === "credit_cards" || subcategory === "credit_card_debt") && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="tracking"
            checked={isTracking}
            onChange={(e) => setIsTracking(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="tracking">Enable automatic expense tracking for this credit card</Label>
        </div>
      )}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any relevant details or notes"
          className="bg-background"
        />
      </div>
    </>
  );
};