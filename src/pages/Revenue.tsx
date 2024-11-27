import { useState } from "react";
import { RevenueSourcesManager } from "@/components/revenue/RevenueSourcesManager";
import { RevenueChart } from "@/components/revenue/RevenueChart";
import { RevenueMetrics } from "@/components/revenue/RevenueMetrics";
import { RevenueCategories } from "@/components/revenue/RevenueCategories";
import { RevenueHeader } from "@/components/revenue/RevenueHeader";
import { RevenueAnalytics } from "@/components/revenue/RevenueAnalytics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Revenue = () => {
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Fetch revenue data
  const { data: revenueData } = useQuery({
    queryKey: ['revenue-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_records')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Calculate metrics
  const totalRevenue = revenueData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
  const averageRevenue = revenueData?.length ? totalRevenue / revenueData.length : 0;

  // Calculate growth rate by comparing with previous period
  const calculateGrowthRate = () => {
    if (!revenueData?.length) return 0;
    
    const sortedData = [...revenueData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const currentPeriodRevenue = sortedData.slice(0, Math.ceil(sortedData.length / 2))
      .reduce((sum, record) => sum + Number(record.amount), 0);
    
    const previousPeriodRevenue = sortedData.slice(Math.ceil(sortedData.length / 2))
      .reduce((sum, record) => sum + Number(record.amount), 0);

    return previousPeriodRevenue ? 
      ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 : 0;
  };

  const growthRate = calculateGrowthRate();

  // Transform data for the chart
  const chartData = revenueData?.map(record => ({
    month: new Date(record.date).toLocaleDateString('default', { month: 'short' }),
    amount: Number(record.amount)
  })) || [];

  // Transform data for categories
  const categoryData = revenueData?.reduce((acc, record) => {
    const existingCategory = acc.find(cat => cat.category === record.category);
    if (existingCategory) {
      existingCategory.amount += Number(record.amount);
    } else {
      acc.push({
        category: record.category,
        amount: Number(record.amount)
      });
    }
    return acc;
  }, [] as Array<{ category: string; amount: number }>) || [];

  const handleAddRevenue = () => {
    // This will be implemented when we add the revenue form
    toast({
      title: "Add Revenue",
      description: "Revenue form will be implemented soon.",
    });
  };

  return (
    <div className="space-y-8 p-8">
      <RevenueHeader 
        onFilterClick={() => setShowFilters(!showFilters)}
        onAddRevenueClick={handleAddRevenue}
      />
      <RevenueSourcesManager />
      <RevenueMetrics 
        totalRevenue={totalRevenue}
        averageRevenue={averageRevenue}
        growthRate={growthRate}
      />
      <RevenueChart data={chartData} />
      <RevenueCategories data={categoryData} />
      <RevenueAnalytics 
        totalRevenue={totalRevenue}
        averageRevenue={averageRevenue}
        growthRate={growthRate}
      />
    </div>
  );
};

export default Revenue;