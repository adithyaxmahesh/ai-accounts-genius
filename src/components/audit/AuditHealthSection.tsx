import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface AuditHealthSectionProps {
  audit: any;
  getRiskLevelExplanation: (level: string) => string;
}

const AuditHealthSection = ({ audit, getRiskLevelExplanation }: AuditHealthSectionProps) => {
  const getAuditHealthStatus = () => {
    const flaggedItems = audit?.audit_items?.filter(item => item.status === 'flagged') || [];
    const totalItems = audit?.audit_items?.length || 0;
    
    if (totalItems === 0) return { status: 'pending', message: 'No items to review' };
    if (flaggedItems.length === 0) return { status: 'good', message: 'No issues found' };
    if (flaggedItems.length / totalItems < 0.2) return { status: 'warning', message: 'Minor issues found' };
    return { status: 'bad', message: 'Significant issues found' };
  };

  const healthStatus = getAuditHealthStatus();

  return (
    <div className="space-y-4">
      <div>
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Risk Level</p>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{getRiskLevelExplanation(audit?.risk_level)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <div className="mt-1">
          {audit?.risk_level}
        </div>
      </div>

      <div>
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Audit Health</p>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Overall assessment based on findings and flagged items</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <Badge 
          variant={
            healthStatus.status === 'good' ? 'success' :
            healthStatus.status === 'warning' ? 'warning' :
            healthStatus.status === 'bad' ? 'destructive' :
            'secondary'
          }
          className="mt-1"
        >
          {healthStatus.message}
        </Badge>
      </div>
    </div>
  );
};

export default AuditHealthSection;