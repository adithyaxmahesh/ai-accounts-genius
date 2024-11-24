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
import { Card } from "@/components/ui/card";

const Revenue = () => {
  const { session } = useAuth();

  const { data: revenueData } = useQuery({
    queryKey: ['revenue', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id,
  });

  // Group revenue by month and year
  const chartData = revenueData?.reduce((acc: any[], curr) => {
    const date = new Date(curr.date);
    const month = date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
    
    // Find or create month entry
    let monthEntry = acc.find(item => item.month === month);
    if (!monthEntry) {
      monthEntry = {
        month,
        amount: 0,
        timestamp: date.getTime() // Store timestamp for sorting
      };
      acc.push(monthEntry);
    }
    
    monthEntry.amount += Number(curr.amount);
    return acc;
  }, [])
  .sort((a, b) => a.timestamp - b.timestamp) // Sort by actual date
  .map(({ month, amount }) => ({ month, amount })) || []; // Remove timestamp from final data

  const totalRevenue = revenueData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
  const averageRevenue = revenueData?.length ? totalRevenue / revenueData.length : 0;

  const categoryData = revenueData?.reduce((acc: any[], curr) => {
    const category = curr.category || 'Uncategorized';
    const existingCategory = acc.find(item => item.category === category);
    
    if (existingCategory) {
      existingCategory.amount += Number(curr.amount);
    } else {
      acc.push({
        category,
        amount: Number(curr.amount)
      });
    }
    return acc;
  }, []) || [];

  const comparisonData = [
    {
      name: 'Jan',
      current: 4000,
      previous: 2400,
    },
    {
      name: 'Feb',
      current: 3000,
      previous: 1398,
    },
    {
      name: 'Mar',
      current: 2000,
      previous: 9800,
    },
    {
      name: 'Apr',
      current: 2780,
      previous: 3908,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <RevenueHeader />
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
            <RevenueComparison data={comparisonData} />
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <RevenueSourcesManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
            {/* Advanced analytics content will go here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Revenue;