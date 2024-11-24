import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueSourcesManager } from "@/components/revenue/RevenueSourcesManager";
import { RevenueCategories } from "@/components/revenue/RevenueCategories";
import { RevenueComparison } from "@/components/revenue/RevenueComparison";
import { RevenueHeader } from "@/components/revenue/RevenueHeader";
import { RevenueMetrics } from "@/components/revenue/RevenueMetrics";
import { RevenueChart } from "@/components/revenue/RevenueChart";
import { RevenueAnalytics } from "@/components/revenue/RevenueAnalytics";
import { RevenueFilters } from "@/components/revenue/RevenueFilters";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Revenue = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [category, setCategory] = useState<string>("");

  const { data: revenueData, refetch } = useQuery({
    queryKey: ['revenue', session?.user.id, dateRange, category],
    queryFn: async () => {
      let query = supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: true });

      if (dateRange.from) {
        query = query.gte('date', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange.to) {
        query = query.lte('date', dateRange.to.toISOString().split('T')[0]);
      }
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id,
  });

  const handleApplyFilters = () => {
    refetch();
    setIsFilterOpen(false);
    toast({
      title: "Filters Applied",
      description: "Your revenue data has been updated.",
    });
  };

  const totalRevenue = revenueData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
  const averageRevenue = revenueData?.length ? totalRevenue / revenueData.length : 0;

  const categoryData = revenueData?.reduce((acc: any[], curr) => {
    const existingCategory = acc.find(item => item.category === curr.category);
    if (existingCategory) {
      existingCategory.amount += Number(curr.amount);
    } else {
      acc.push({ category: curr.category, amount: Number(curr.amount) });
    }
    return acc;
  }, []) || [];

  const chartData = revenueData?.map(item => ({
    month: new Date(item.date).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
    amount: Number(item.amount)
  })) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <RevenueHeader 
        onFilterClick={() => setIsFilterOpen(true)}
        onAddRevenueClick={() => {}} // Implement this if needed
      />
      <RevenueMetrics totalRevenue={totalRevenue} averageRevenue={averageRevenue} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Revenue Sources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RevenueChart data={chartData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RevenueCategories data={categoryData} />
            <RevenueComparison data={revenueData || []} />
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <RevenueSourcesManager />
        </TabsContent>

        <TabsContent value="analytics">
          <RevenueAnalytics 
            totalRevenue={totalRevenue}
            averageRevenue={averageRevenue}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <RevenueFilters 
            dateRange={dateRange}
            category={category}
            onDateRangeChange={setDateRange}
            onCategoryChange={setCategory}
            onApplyFilters={handleApplyFilters}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Revenue;