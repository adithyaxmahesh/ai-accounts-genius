import { FinancialMetrics } from "@/components/FinancialMetrics";
import { OverviewInsights } from "@/components/overview/OverviewInsights";

export const DashboardMetrics = () => {
  return (
    <div className="space-y-4">
      <OverviewInsights />
      <FinancialMetrics />
    </div>
  );
};