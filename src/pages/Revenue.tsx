import { RevenueSourcesManager } from "@/components/revenue/RevenueSourcesManager";
import { RevenueChart } from "@/components/revenue/RevenueChart";
import { RevenueMetrics } from "@/components/revenue/RevenueMetrics";
import { RevenueCategories } from "@/components/revenue/RevenueCategories";
import { RevenueHeader } from "@/components/revenue/RevenueHeader";
import { RevenueAnalytics } from "@/components/revenue/RevenueAnalytics";

const Revenue = () => {
  return (
    <div className="space-y-8 p-8">
      <RevenueHeader />
      <RevenueSourcesManager />
      <RevenueMetrics />
      <RevenueChart />
      <RevenueCategories />
      <RevenueAnalytics />
    </div>
  );
};

export default Revenue;