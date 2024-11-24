import { DollarSign, Calculator } from "lucide-react";
import { TaxSummaryCard } from "./TaxSummaryCard";

interface TaxSummaryGridProps {
  totalAmount: number;
  deductions: number;
  taxableIncome: number;
  minimumTax: number;
  estimatedTax: number;
  effectiveRate: number;
}

export const TaxSummaryGrid = ({
  totalAmount,
  deductions,
  taxableIncome,
  minimumTax,
  estimatedTax,
  effectiveRate,
}: TaxSummaryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TaxSummaryCard
        icon={DollarSign}
        title="Total Revenue"
        value={`$${totalAmount.toLocaleString()}`}
        className="text-primary"
      />

      <TaxSummaryCard
        icon={DollarSign}
        title="Deductions"
        value={`$${deductions.toLocaleString()}`}
        className="text-green-500"
      />

      <TaxSummaryCard
        icon={DollarSign}
        title="Taxable Income"
        value={`$${taxableIncome.toLocaleString()}`}
        className="text-yellow-500"
      />

      <TaxSummaryCard
        icon={Calculator}
        title="Minimum Tax"
        value={`$${minimumTax.toLocaleString()}`}
        className="text-purple-500"
      />

      <TaxSummaryCard
        icon={DollarSign}
        title="Estimated Tax"
        value={`$${estimatedTax.toLocaleString()}`}
        className="text-red-500"
      />

      <TaxSummaryCard
        icon={DollarSign}
        title="Effective Rate"
        value={`${effectiveRate.toFixed(2)}%`}
        className="text-indigo-500"
      />
    </div>
  );
};