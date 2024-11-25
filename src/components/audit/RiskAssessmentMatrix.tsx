import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface RiskAssessment {
  id: string;
  risk_category: string;
  likelihood: number;
  impact: number;
  mitigation_steps: string[];
}

interface RiskAssessmentMatrixProps {
  auditId: string;
}

const RiskAssessmentMatrix = ({ auditId }: RiskAssessmentMatrixProps) => {
  const { data: riskAssessments, isLoading } = useQuery({
    queryKey: ['risk-assessments', auditId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_risk_assessments')
        .select('*')
        .eq('audit_id', auditId);
      
      if (error) throw error;
      return data as RiskAssessment[];
    }
  });

  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 0.6) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <Info className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Risk Assessment Matrix</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Assessment of identified risks and their potential impact</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        {riskAssessments?.map((risk) => {
          const riskLevel = getRiskLevel(risk.likelihood, risk.impact);
          return (
            <div
              key={risk.id}
              className={`p-4 rounded-lg border ${getRiskColor(riskLevel)}`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(riskLevel)}
                    <h4 className="font-medium">{risk.risk_category}</h4>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="text-sm font-medium">
                          Risk Score: {((risk.likelihood * risk.impact) * 100).toFixed(0)}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Combined score of likelihood and impact</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Likelihood</span>
                      <span>{(risk.likelihood * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={risk.likelihood * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Impact</span>
                      <span>{(risk.impact * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={risk.impact * 100} className="h-2" />
                  </div>
                </div>

                {risk.mitigation_steps && risk.mitigation_steps.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">Mitigation Steps:</h5>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {risk.mitigation_steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {(!riskAssessments || riskAssessments.length === 0) && (
          <div className="text-center text-muted-foreground py-8">
            No risk assessments have been recorded yet.
          </div>
        )}
      </div>
    </Card>
  );
};

export default RiskAssessmentMatrix;