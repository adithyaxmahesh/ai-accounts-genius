import { FinancialAdvisor } from "@/components/ai-advisor/FinancialAdvisor";
import { QueryInterface } from "@/components/QueryInterface";
import { AiInsights } from "@/components/ai-insights/AiInsights";
import { FraudDetection } from "@/components/fraud-detection/FraudDetection";
import { IncomeStatementDisplay } from "@/components/income-statement/IncomeStatementDisplay";
import { useFinancialData } from "@/hooks/useFinancialData";
import { RevenueAnalytics } from "@/components/revenue/RevenueAnalytics";
import { RevenueCategories } from "@/components/revenue/RevenueCategories";

export default function Index() {
  const { data: financialData } = useFinancialData();

  const revenueByCategory = financialData?.revenues?.reduce((acc, revenue) => {
    acc.push({
      category: revenue.category,
      amount: revenue.amount
    });
    return acc;
  }, [] as Array<{ category: string; amount: number }>) || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Financial Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <FinancialAdvisor />
        <QueryInterface />
        <AiInsights />
        <FraudDetection />
        <IncomeStatementDisplay />
        {financialData && (
          <>
            <RevenueAnalytics 
              totalRevenue={financialData.totalRevenue} 
              averageRevenue={financialData.averageRevenue} 
            />
            <RevenueCategories data={revenueByCategory} />
          </>
        )}
      </div>
    </div>
  );
}