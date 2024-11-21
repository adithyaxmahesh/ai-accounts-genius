import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface TaxSummaryProps {
  analysis: any;
}

export const TaxSummary = ({ analysis }: TaxSummaryProps) => {
  // Ensure we have valid numbers even if the analysis is empty
  const taxDue = analysis?.tax_impact || 0;
  const deductions = analysis?.recommendations?.total_deductions || 0;
  const missingDocs = analysis?.recommendations?.missing_docs?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <DollarSign className="h-5 w-5 text-primary mb-2" />
        <h3 className="text-sm font-medium">Estimated Tax Due</h3>
        <p className="text-2xl font-bold">${taxDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </Card>

      <Card className="p-4">
        <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
        <h3 className="text-sm font-medium">Deductions Found</h3>
        <p className="text-2xl font-bold text-green-500">
          ${deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </Card>

      <Card className="p-4">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mb-2" />
        <h3 className="text-sm font-medium">Missing Documentation</h3>
        <p className="text-2xl font-bold text-yellow-500">{missingDocs}</p>
      </Card>
    </div>
  );
};