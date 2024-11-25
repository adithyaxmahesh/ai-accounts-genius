import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, Shield, Lightbulb, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AIInsight } from "@/components/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const AiInsights = () => {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: insights, isLoading } = useQuery<AIInsight[]>({
    queryKey: ['ai-insights', session?.user.id],
    queryFn: async () => {
      // Fetch financial insights
      const { data: revenueData } = await supabase
        .from('revenue_records')
        .select('amount, date')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });

      const { data: writeOffs } = await supabase
        .from('write_offs')
        .select('amount, date')
        .eq('user_id', session?.user.id)
        .order('date', { ascending: false });

      // Fetch AI assurance analysis
      const { data: assuranceAnalysis } = await supabase
        .from('ai_assurance_analysis')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate financial insights
      const totalRevenue = revenueData?.reduce((sum, record) => sum + record.amount, 0) || 0;
      const totalWriteOffs = writeOffs?.reduce((sum, record) => sum + record.amount, 0) || 0;
      const netIncome = totalRevenue - totalWriteOffs;

      // Combine financial and assurance insights
      const insights: AIInsight[] = [
        {
          id: 1,
          category: 'trend',
          insight: `Your net income is $${netIncome.toFixed(2)}. This represents the difference between your total revenue ($${totalRevenue.toFixed(2)}) and write-offs ($${totalWriteOffs.toFixed(2)}).`
        },
        {
          id: 2,
          category: 'optimization',
          insight: `Your write-offs represent ${((totalWriteOffs / totalRevenue) * 100).toFixed(1)}% of your revenue. ${
            totalWriteOffs / totalRevenue > 0.3 ? 'Consider reviewing your expenses for optimization opportunities.' : 'This is within a healthy range.'
          }`
        },
        {
          id: 3,
          category: 'alert',
          insight: `Based on your transaction history, your monthly revenue average is $${(totalRevenue / (revenueData?.length || 1)).toFixed(2)}.`
        },
        // Add AI assurance insights
        ...(assuranceAnalysis?.map((analysis, index) => ({
          id: 4 + index,
          category: 'assurance',
          insight: `Assurance Analysis: Risk Score ${(analysis.risk_score * 100).toFixed(1)}%, Confidence Score ${(analysis.confidence_score * 100).toFixed(1)}%. ${
            analysis.findings?.[0]?.description || 'No significant findings.'
          }`,
          recommendations: analysis.recommendations,
          evidenceValidation: analysis.evidence_validation,
          created_at: analysis.created_at,
          confidence_score: analysis.confidence_score
        })) || [])
      ];

      return insights;
    }
  });

  const chartData = insights?.map(insight => ({
    date: insight.created_at ? new Date(insight.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
    confidence: insight.confidence_score || 0
  })) || [];

  if (isLoading) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-muted animate-pulse">
        <div className="h-64 bg-muted/50 rounded-lg"></div>
      </Card>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'optimization':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'assurance':
        return <Shield className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trend':
        return 'bg-blue-500/10 text-blue-500';
      case 'optimization':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'assurance':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-red-500/10 text-red-500';
    }
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-muted hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary animate-pulse" />
          <h2 className="text-xl font-semibold">AI Financial Insights</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-primary/10"
          onClick={() => {
            toast({
              title: "Refreshing insights...",
              description: "Analyzing your latest financial data",
            });
          }}
        >
          <ArrowUpRight className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="h-64 mb-6 bg-muted/50 rounded-lg p-4 hover:bg-muted/60 transition-colors">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              stroke="currentColor" 
              className="text-xs" 
            />
            <YAxis 
              stroke="currentColor" 
              className="text-xs"
            />
            <Tooltip 
              contentStyle={{ 
                background: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }} 
            />
            <Area
              type="monotone"
              dataKey="confidence"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorConfidence)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4">
        {insights?.map((insight) => (
          <div 
            key={insight.id} 
            className="p-4 bg-muted/50 rounded-lg hover:bg-muted/60 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-3">
              {getCategoryIcon(insight.category)}
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${getCategoryColor(insight.category)}`}>
                {insight.category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.insight}</p>
            {insight.recommendations && insight.recommendations.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-primary">Recommendations:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {insight.recommendations.map((rec, index) => (
                    <li key={index} className="hover:text-primary transition-colors">
                      {rec.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};