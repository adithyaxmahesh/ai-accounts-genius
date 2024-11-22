import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { FinancialForecast } from "@/components/FinancialForecast";
import { BusinessIntelligence } from "@/components/BusinessIntelligence";
import { TransactionList } from "@/components/TransactionList";
import { TaxSummaryCard } from "@/components/tax-summary/TaxSummaryCard";
import { TaxInsightsCard } from "@/components/tax-insights/TaxInsightsCard";
import { FinancialHealthCard } from "@/components/financial-health/FinancialHealthCard";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FinancialHealthCard />
        <FinancialMetrics />
        <TaxSummaryCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialForecast />
        <BusinessIntelligence />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TaxInsightsCard />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TransactionList />
      </div>

      <div className="flex justify-end space-x-4">
        <Button onClick={() => navigate("/documents")} variant="outline">
          Manage Documents
        </Button>
        <Button onClick={() => navigate("/write-offs")}>Track Write-offs</Button>
      </div>
    </div>
  );
}