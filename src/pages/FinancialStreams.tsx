import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useFinancialStreams } from "@/hooks/useFinancialStreams";
import { RevenueSourcesManager } from "@/components/revenue/RevenueSourcesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FinancialStreams = () => {
  const navigate = useNavigate();
  const { data: streams, isLoading } = useFinancialStreams();

  const totalRevenue = streams?.filter(s => s.type === 'revenue')
    .reduce((sum, s) => sum + s.amount, 0) || 0;
  
  const totalExpenses = streams?.filter(s => s.type === 'expense')
    .reduce((sum, s) => sum + s.amount, 0) || 0;
  
  const totalWriteOffs = streams?.filter(s => s.type === 'write_off')
    .reduce((sum, s) => sum + s.amount, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="hover-scale"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Total Revenue</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${totalRevenue.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">Total Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">
            ${totalExpenses.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Total Write-Offs</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            ${totalWriteOffs.toLocaleString()}
          </p>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Revenue Sources</TabsTrigger>
          <TabsTrigger value="all">All Streams</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <RevenueSourcesManager />
        </TabsContent>

        <TabsContent value="all">
          <Card className="p-6">
            <div className="space-y-4">
              {streams?.map((stream) => (
                <div
                  key={`${stream.source}-${stream.id}`}
                  className="flex justify-between items-center p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{stream.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {stream.category} - {new Date(stream.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      stream.type === 'revenue' ? 'text-green-600' :
                      stream.type === 'expense' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      ${stream.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {stream.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialStreams;