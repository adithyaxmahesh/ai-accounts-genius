import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuditProgressProps {
  status: string;
  getStatusExplanation: (status: string) => string;
}

export const getAuditProgress = (status: string) => {
  const stages = ['planning', 'control_evaluation', 'evidence_gathering', 'review', 'completed'];
  const currentIndex = stages.indexOf(status);
  return Math.round(((currentIndex + 1) / stages.length) * 100);
};

export const getAuditAccomplishments = (status: string) => {
  switch (status) {
    case 'planning':
      return "Initial audit scope defined and risk areas identified";
    case 'control_evaluation':
      return "Internal controls assessed and test procedures established";
    case 'evidence_gathering':
      return "Financial documents analyzed and evidence collected";
    case 'review':
      return "Findings compiled and recommendations drafted";
    case 'completed':
      return "Full audit completed with detailed findings and recommendations";
    default:
      return "Audit not yet started";
  }
};

const AuditProgress = ({ status, getStatusExplanation }: AuditProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-muted-foreground">Current Phase</p>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{getStatusExplanation(status)}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className={`mt-1 px-3 py-1 rounded-full text-sm inline-block ${
        status === 'completed' ? 'bg-green-100 text-green-800' :
        status === 'review' ? 'bg-orange-100 text-orange-800' :
        status === 'evidence_gathering' ? 'bg-purple-100 text-purple-800' :
        status === 'control_evaluation' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {status?.replace('_', ' ')}
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium">Progress: {getAuditProgress(status)}%</p>
        <p className="text-sm text-muted-foreground mt-1">
          {getAuditAccomplishments(status)}
        </p>
      </div>
    </div>
  );
};

export default AuditProgress;