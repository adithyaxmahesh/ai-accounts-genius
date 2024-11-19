import { Info, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

interface Finding {
  category: string;
  description: string;
  impact: string;
  severity: string;
  recommendation?: string;
  status: string;
  details?: string[];
}

interface AuditFindingsProps {
  findings: Finding[];
  status: string;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'medium':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'low':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <HelpCircle className="h-4 w-4 text-gray-500" />;
  }
};

const AuditFindings = ({ findings, status }: AuditFindingsProps) => {
  if (!findings?.length) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          <p className="text-sm">
            {status === 'completed' 
              ? "No significant findings were identified in this audit."
              : "Findings will be displayed here as they are discovered during the audit process."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <TooltipProvider>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(finding.severity)}
                  <h4 className="font-semibold">{finding.category}</h4>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Impact Level: {finding.impact}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              <p className="text-sm text-muted-foreground">{finding.description}</p>
              
              {finding.details && (
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  {finding.details.map((detail, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className={`px-2 py-1 rounded-full text-xs ${
              finding.severity === 'high' ? 'bg-red-100 text-red-800' :
              finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {finding.severity} severity
            </div>
          </div>

          {finding.recommendation && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm">
                <span className="font-medium">Recommendation:</span> {finding.recommendation}
              </p>
            </div>
          )}

          <div className="mt-2 text-sm">
            <span className={`inline-block px-2 py-1 rounded-full ${
              finding.status === 'resolved' ? 'bg-green-100 text-green-800' :
              finding.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Status: {finding.status.replace('_', ' ')}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AuditFindings;