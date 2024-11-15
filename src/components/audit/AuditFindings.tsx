import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

interface AuditFindingsProps {
  findings: any[];
  status: string;
}

const AuditFindings = ({ findings, status }: AuditFindingsProps) => {
  if (!findings?.length) {
    return (
      <Card className="p-4 text-muted-foreground text-sm">
        {status === 'completed' 
          ? "No significant findings were identified in this audit."
          : "Findings will be displayed here as they are discovered during the audit process."}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{finding.category}</h4>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Impact Level: {finding.impact || 'Low'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">{finding.description}</p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs ${
              finding.severity === 'high' ? 'bg-red-100 text-red-800' :
              finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {finding.severity || 'low'} severity
            </div>
          </div>
          {finding.recommendation && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm">
                <span className="font-medium">Recommendation:</span> {finding.recommendation}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AuditFindings;