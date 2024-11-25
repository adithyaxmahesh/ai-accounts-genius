import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, AlertTriangle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { AIInsight } from "@/components/types";

export const AiInsights = () => {
  const { session } = useAuth();

  const { data: insights } = useQuery<AIInsight[]>({
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
          evidenceValidation: analysis.evidence_validation
        })) || [])
      ];

      return insights;
    }
  });

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">AI Financial & Assurance Insights</h2>
      </div>

      <div className="space-y-4">
        {insights?.map((insight) => (
          <div key={insight.id} className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {insight.category === 'trend' ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : insight.category === 'assurance' ? (
                <Shield className="h-4 w-4 text-blue-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <p className="font-semibold capitalize">{insight.category}</p>
            </div>
            <p className="text-sm text-muted-foreground">{insight.insight}</p>
            {insight.recommendations && (
              <div className="mt-2">
                <p className="text-sm font-medium">Recommendations:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {insight.recommendations.map((rec, index) => (
                    <li key={index}>{rec.description}</li>
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