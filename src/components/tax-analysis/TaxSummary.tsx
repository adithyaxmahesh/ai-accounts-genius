import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { AutomaticTaxCard } from "@/components/tax-insights/AutomaticTaxCard";

interface TaxSummaryProps {
  analysis: any;
}

export const TaxSummary = ({ analysis }: TaxSummaryProps) => {
  return <AutomaticTaxCard />;
};