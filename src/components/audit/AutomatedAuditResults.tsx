import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface AutomatedAuditResultsProps {
  results: {
    riskScores?: {
      overallScore: number;
      factors: {
        transactionVolume: number;
        largeTransactions: number;
        unusualPatterns: number;
        controlWeaknesses: number;
      };
    };
    controlEffectiveness?: {
      overallEffectiveness: number;
      tests: Array<{
        name: string;
        result: {
          score: number;
          findings: string[];
        };
      }>;
    };
    anomaly_detection?: {
      anomalies: Array<{
        type: string;
        description: string;
        severity: string;
      }>;
      count: number;
    };
  };
}

export const AutomatedAuditResults = ({ results }: AutomatedAuditResultsProps) => {
  const getRiskColor = (score: number) => {
    if (score > 0.7) return "text-red-500";
    if (score > 0.4) return "text-yellow-500";
    return "text-green-500";
  };

  const getEffectivenessColor = (score: number) => {
    if (score < 0.3) return "text-red-500";
    if (score < 0.7) return "text-yellow-500";
    return "text-green-500";
  };

  if (!results) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No automated analysis results available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {results.riskScores && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-primary" />
            Risk Assessment
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Overall Risk Score</span>
              <span className={getRiskColor(results.riskScores.overallScore)}>
                {(results.riskScores.overallScore * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="space-y-2">
              {Object.entries(results.riskScores.factors || {}).map(([factor, score]) => (
                <div key={factor} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{factor.replace(/_/g, ' ')}</span>
                    <span className={getRiskColor(score)}>
                      {(score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={score * 100} 
                    className="h-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {results.controlEffectiveness && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-primary" />
            Control Effectiveness
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Overall Effectiveness</span>
              <span className={getEffectivenessColor(results.controlEffectiveness.overallEffectiveness)}>
                {(results.controlEffectiveness.overallEffectiveness * 100).toFixed(1)}%
              </span>
            </div>

            <div className="space-y-4">
              {results.controlEffectiveness.tests.map((test) => (
                <div key={test.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{test.name.replace(/_/g, ' ')}</span>
                    <span className={getEffectivenessColor(test.result.score)}>
                      {(test.result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={test.result.score * 100} 
                    className="h-1"
                  />
                  <ul className="text-sm text-muted-foreground ml-4">
                    {test.result.findings.map((finding, index) => (
                      <li key={index} className="list-disc">{finding}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {results.anomaly_detection && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-primary" />
            Anomaly Detection
          </h3>
          
          {results.anomaly_detection.count === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No anomalies detected
            </div>
          ) : (
            <div className="space-y-4">
              {results.anomaly_detection.anomalies.map((anomaly, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <AlertTriangle className={`h-5 w-5 ${
                    anomaly.severity === 'high' ? 'text-red-500' : 
                    anomaly.severity === 'medium' ? 'text-yellow-500' : 
                    'text-orange-500'
                  }`} />
                  <div>
                    <p className="font-medium capitalize">{anomaly.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};