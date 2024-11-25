import { FinancialPlanningCard } from "@/components/financial-planning/FinancialPlanningCard";
import { FinancialHealthCard } from "@/components/financial-health/FinancialHealthCard";
import { BusinessMetrics } from "@/components/dashboard/BusinessMetrics";
import { CollaboratorsList } from "@/components/collaborators/CollaboratorsList";
import { AutomationRules } from "@/components/automation/AutomationRules";

export const DashboardFeatures = () => {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      <div className="space-y-2">
        <FinancialPlanningCard />
        <FinancialHealthCard />
        <BusinessMetrics />
      </div>
      <div className="space-y-2">
        <CollaboratorsList />
        <AutomationRules />
      </div>
    </div>
  );
};