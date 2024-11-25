import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type AIAnalysisOutcomeProps = {
  engagementId: string;
  clientName: string;
  riskScore: number;
  confidenceScore: number;
  findings: Array<{ severity: string; description: string }>;
  recommendations: Array<{ priority: string; description: string }>;
};

export const AIAnalysisOutcome = ({
  engagementId,
  clientName,
  riskScore,
  confidenceScore,
  findings,
  recommendations,
}: AIAnalysisOutcomeProps) => {
  const getProgressColor = (score: number) => {
    if (score > 0.7) return 'bg-red-500';
    if (score > 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{clientName}</h4>
        <div className="flex gap-2">
          <Badge variant={riskScore > 0.7 ? "destructive" : riskScore > 0.4 ? "warning" : "success"}>
            Risk Score: {(riskScore * 100).toFixed(0)}%
          </Badge>
          <Badge variant="outline">
            Confidence: {(confidenceScore * 100).toFixed(0)}%
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        {findings.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Key Findings
            </h5>
            <ul className="space-y-1">
              {findings.map((finding, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className={`mt-1 h-2 w-2 rounded-full ${
                    finding.severity === 'high' ? 'bg-red-500' :
                    finding.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  {finding.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Recommendations
            </h5>
            <ul className="space-y-1">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className={`mt-1 h-2 w-2 rounded-full ${
                    rec.priority === 'high' ? 'bg-red-500' :
                    rec.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  {rec.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={`h-2 w-full rounded-full bg-secondary overflow-hidden`}>
        <div 
          className={`h-full transition-all ${getProgressColor(riskScore)}`}
          style={{ width: `${100 - (riskScore * 100)}%` }}
        />
      </div>
    </div>
  );
};