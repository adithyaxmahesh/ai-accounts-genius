import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Download, Filter, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RevenueSourcesManager } from "@/components/revenue/RevenueSourcesManager";
import { RevenueCategories } from "@/components/revenue/RevenueCategories";
import { RevenueComparison } from "@/components/revenue/RevenueComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Revenue = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: revenueData } = useQuery({
    queryKey: ['revenue', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user.id,
  });

  const chartData = revenueData?.reduce((acc: any[], curr) => {
    const month = new Date(curr.date).toLocaleDateString('default', { month: 'short' });
    const existingMonth = acc.find(item => item.month === month);
    
    if (existingMonth) {
      existingMonth.amount += Number(curr.amount);
    } else {
      acc.push({
        month,
        amount: Number(curr.amount)
      });
    }
    return acc;
  }, []) || [];

  const totalRevenue = revenueData?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
  const averageRevenue = revenueData?.length ? totalRevenue / revenueData.length : 0;

  const handleExportData = () => {
    toast({
      title: "Exporting Revenue Data",
      description: "Your data will be downloaded shortly.",
    });
    // Implementation for exporting data would go here
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Revenue</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button onClick={() => navigate('/revenue/add')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Revenue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card">
          <h3 className="text-xl font-semibold mb-4">Total Revenue</h3>
          <p className="text-3xl font-bold text-primary">${totalRevenue.toLocaleString()}</p>
        </Card>

        <Card className="p-6 bg-card">
          <h3 className="text-xl font-semibold mb-4">Average Revenue</h3>
          <p className="text-3xl font-bold text-primary">${averageRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</p>
        </Card>

        <Card className="p-6 bg-card">
          <h3 className="text-xl font-semibold mb-4">Growth Rate</h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <p className="text-3xl font-bold text-green-500">+12.5%</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Revenue Sources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6 bg-card">
            <h3 className="text-xl font-semibold mb-4">Revenue Over Time</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#888" 
                    tick={{ fill: '#888' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    stroke="#888"
                    tick={{ fill: '#888' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: '#1A1F2C',
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#888' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#9b87f5"
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

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
