import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface AuditHealthProps {
  audit: any;
  getRiskLevelExplanation: (level: string) => string;
}

const AuditHealthSection = ({ audit, getRiskLevelExplanation }: AuditHealthProps) => {
  const getRiskScoreColor = (score: number) => {
    if (score >= 0.7) return "text-red-500";
    if (score >= 0.4) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getControlEffectivenessScore = () => {
    const controls = audit?.internal_control_assessment || {};
    if (!Object.keys(controls).length) return 0;

    const scoreMap = {
      effective: 1,
      needs_improvement: 0.5,
      ineffective: 0
    };

    const total = Object.values(controls).length;
    const score = Object.values(controls).reduce((acc: number, val: any) => 
      acc + (scoreMap[val as keyof typeof scoreMap] || 0), 0);

    return (score / total) * 100;
  };

  return (
    <Card className="p-4 w-full max-w-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Audit Health</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Overall health assessment of the audit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          {getRiskIcon(audit?.risk_level)}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Risk Level:</span>
              <Badge variant={
                audit?.risk_level === 'high' ? 'destructive' :
                audit?.risk_level === 'medium' ? 'warning' :
                'success'
              }>
                {audit?.risk_level || 'Not assessed'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {getRiskLevelExplanation(audit?.risk_level)}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Control Effectiveness</span>
            <span className="text-sm text-muted-foreground">
              {getControlEffectivenessScore().toFixed(0)}%
            </span>
          </div>
          <Progress value={getControlEffectivenessScore()} className="h-2" />
        </div>

        {audit?.risk_scores && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Risk Categories</span>
            {Object.entries(audit.risk_scores).map(([category, score]: [string, any]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm">{category.replace('_', ' ')}</span>
                <span className={`text-sm font-medium ${getRiskScoreColor(score)}`}>
                  {(score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AuditHealthSection;