import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface TaxSummaryProps {
  audit: any;
}

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const calculateTaxes = () => {
    if (!audit?.audit_items) return { totalAmount: 0, estimatedTax: 0, deductions: 0 };
    
    const totalAmount = audit.audit_items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const deductions = audit.audit_items
      .filter(item => item.category === 'deduction')
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const taxableIncome = totalAmount - deductions;
    const estimatedTax = taxableIncome * 0.25; // 25% tax rate for example
    
    return {
      totalAmount,
      deductions,
      estimatedTax: Math.max(0, estimatedTax)
    };
  };

  const { totalAmount, deductions, estimatedTax } = calculateTaxes();

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Tax Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deductions</p>
            <p className="text-2xl font-bold text-green-600">-${deductions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated Tax Due</p>
            <p className="text-2xl font-bold text-blue-600">${estimatedTax.toLocaleString()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaxSummaryTab;