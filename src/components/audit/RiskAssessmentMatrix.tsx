import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RiskAssessmentMatrixProps {
  auditId: string;
}

const RiskAssessmentMatrix = ({ auditId }: RiskAssessmentMatrixProps) => {
  const { data: riskAssessments } = useQuery({
    queryKey: ['risk-assessments', auditId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_risk_assessments')
        .select('*')
        .eq('audit_id', auditId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!auditId
  });

  const getRiskColor = (likelihood: number, impact: number) => {
    const riskScore = likelihood * impact;
    if (riskScore >= 12) return "bg-red-100 text-red-800";
    if (riskScore >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  if (!riskAssessments?.length) return null;

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Risk Assessment Matrix</h3>
      <div className="space-y-4">
        {riskAssessments.map((assessment: any) => (
          <div
            key={assessment.id}
            className="p-4 rounded-lg border"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{assessment.risk_category}</h4>
                {assessment.mitigation_steps && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Mitigation Steps:</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {assessment.mitigation_steps.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${getRiskColor(
                assessment.likelihood,
                assessment.impact
              )}`}>
                Risk Score: {assessment.likelihood * assessment.impact}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Likelihood</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${(assessment.likelihood / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Impact</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${(assessment.impact / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RiskAssessmentMatrix;