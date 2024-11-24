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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Revenue = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [category, setCategory] = useState<string>("");
  const [newRevenue, setNewRevenue] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

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

  // Group revenue by month and year
  const chartData = revenueData?.reduce((acc: any[], curr) => {
    const date = new Date(curr.date);
    const month = date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
    
    let monthEntry = acc.find(item => item.month === month);
    if (!monthEntry) {
      monthEntry = {
        month,
        amount: 0,
        timestamp: date.getTime()
      };
      acc.push(monthEntry);
    }
    
    monthEntry.amount += Number(curr.amount);
    return acc;
  }, [])
  .sort((a, b) => a.timestamp - b.timestamp)
  .map(({ month, amount }) => ({ month, amount })) || [];

  const totalRevenue = revenueData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
  const averageRevenue = revenueData?.length ? totalRevenue / revenueData.length : 0;

  const handleAddRevenue = async () => {
    try {
      const { error } = await supabase
        .from('revenue_records')
        .insert({
          user_id: session?.user.id,
          amount: Number(newRevenue.amount),
          category: newRevenue.category,
          description: newRevenue.description,
          date: newRevenue.date
        });

      if (error) throw error;

      toast({
        title: "Revenue Added",
        description: "Your revenue has been successfully recorded.",
      });

      setIsAddRevenueOpen(false);
      setNewRevenue({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add revenue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilter = () => {
    refetch();
    setIsFilterOpen(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <RevenueHeader 
        onFilterClick={() => setIsFilterOpen(true)}
        onAddRevenueClick={() => setIsAddRevenueOpen(true)}
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
            <RevenueCategories data={revenueData || []} />
            <RevenueComparison data={[]} />
          </div>
        </TabsContent>

        <TabsContent value="sources">
          <RevenueSourcesManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RevenueAnalytics 
            totalRevenue={totalRevenue}
            averageRevenue={averageRevenue}
          />
        </TabsContent>
      </Tabs>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <RevenueFilters 
            dateRange={dateRange}
            category={category}
            onDateRangeChange={setDateRange}
            onCategoryChange={setCategory}
            onApplyFilters={handleFilter}
          />
        </DialogContent>
      </Dialog>

      {/* Add Revenue Dialog */}
      <Dialog open={isAddRevenueOpen} onOpenChange={setIsAddRevenueOpen}>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={newRevenue.amount}
                onChange={(e) => setNewRevenue(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newRevenue.category}
                onValueChange={(value) => setNewRevenue(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="investments">Investments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newRevenue.description}
                onChange={(e) => setNewRevenue(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newRevenue.date}
                onChange={(e) => setNewRevenue(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <Button className="w-full" onClick={handleAddRevenue}>Add Revenue</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Revenue;