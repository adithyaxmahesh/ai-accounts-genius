import { FinancialMetrics } from "@/components/FinancialMetrics";
import { OverviewInsights } from "@/components/overview/OverviewInsights";
import { FinancialPlanningCard } from "@/components/financial-planning/FinancialPlanningCard";
import { FinancialHealthCard } from "@/components/financial-health/FinancialHealthCard";
import { CollaboratorsList } from "@/components/collaborators/CollaboratorsList";
import { AutomationRules } from "@/components/automation/AutomationRules";
import { FinancialInsights } from "@/components/financial-insights/FinancialInsights";

export const DashboardContent = () => {
  return (
    <div className="space-y-4">
      <OverviewInsights />
      <FinancialMetrics />
      
      <div className="grid gap-6">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="space-y-2">
            <FinancialPlanningCard />
            <FinancialHealthCard />
          </div>
          <div className="space-y-2">
            <CollaboratorsList />
            <AutomationRules />
          </div>
        </div>
        
        {/* Financial Insights at bottom */}
        <FinancialInsights />
      </div>
    </div>
  );
};