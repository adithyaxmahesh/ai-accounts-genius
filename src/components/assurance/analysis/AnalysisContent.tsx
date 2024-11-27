import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, Scale, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisContentProps {
  analysis: any;
}

export const AnalysisContent = ({ analysis }: AnalysisContentProps) => {
  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Badge variant={
          analysis.risk_score > 0.7 ? "destructive" : 
          analysis.risk_score > 0.4 ? "warning" : 
          "success"
        } className="flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          Risk Assessment: {(analysis.risk_score * 100).toFixed(0)}%
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Scale className="h-3 w-3" />
          Materiality Score: {(analysis.confidence_score * 100).toFixed(0)}%
        </Badge>
      </div>
      
      {analysis.findings?.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium flex items-center gap-2 text-primary">
            <FileText className="h-4 w-4" />
            Material Findings
          </h5>
          <div className="space-y-3">
            {analysis.findings.map((finding: any, idx: number) => (
              <div key={idx} className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <span className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    finding.severity === 'high' ? 'bg-red-500' :
                    finding.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  )} />
                  <div>
                    <p className="font-medium">{finding.description}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {finding.category}
                      </Badge>
                      <Badge variant={
                        finding.severity === 'high' ? "destructive" :
                        finding.severity === 'medium' ? "warning" :
                        "outline"
                      } className="text-xs">
                        {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)} Risk
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {analysis.recommendations?.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium flex items-center gap-2 text-primary">
            <BarChart3 className="h-4 w-4" />
            Recommendations
          </h5>
          <div className="space-y-3">
            {analysis.recommendations.map((rec: any, idx: number) => (
              <div key={idx} className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <span className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    rec.priority === 'high' ? 'bg-red-500' :
                    rec.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  )} />
                  <div>
                    <p className="font-medium">{rec.description}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {rec.area}
                      </Badge>
                      <Badge variant={
                        rec.priority === 'high' ? "destructive" :
                        rec.priority === 'medium' ? "warning" :
                        "outline"
                      } className="text-xs">
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.impact} Impact
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Progress 
        value={100 - (analysis.risk_score * 100)} 
        className={cn(
          "h-2",
          analysis.risk_score > 0.7 ? "bg-red-500" :
          analysis.risk_score > 0.4 ? "bg-yellow-500" :
          "bg-green-500"
        )}
      />
    </div>
  );
};