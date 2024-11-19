import { Card } from "@/components/ui/card";
import { DollarSign, MapPin } from "lucide-react";

interface TaxSummaryProps {
  audit: any;
}

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const calculateTaxes = () => {
    if (!audit?.audit_items) return { 
      totalAmount: 0, 
      estimatedTax: 0, 
      deductions: 0,
      state: 'California',
      effectiveRate: 0
    };
    
    const totalAmount = audit.audit_items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const deductions = audit.audit_items
      .filter(item => item.category === 'deduction')
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const taxableIncome = totalAmount - deductions;
    const estimatedTax = audit.tax_impact || 0;
    const effectiveRate = totalAmount > 0 ? (estimatedTax / totalAmount) * 100 : 0;
    
    return {
      totalAmount,
      deductions,
      estimatedTax,
      state: audit.jurisdiction || 'California',
      effectiveRate
    };
  };

  const { totalAmount, deductions, estimatedTax, state, effectiveRate } = calculateTaxes();

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue-700 flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Tax Summary
          </h2>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {state}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div>
            <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
            <p className="text-2xl font-bold text-purple-600">{effectiveRate.toFixed(2)}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaxSummaryTab;