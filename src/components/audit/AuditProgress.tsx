import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

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
  const accomplishments = {
    planning: [
      "Initial risk assessment completed",
      "Audit scope defined",
      "Key risk areas identified",
      "Preliminary analysis performed"
    ],
    control_evaluation: [
      "Internal controls assessed",
      "Control weaknesses identified",
      "Test procedures established",
      "Risk management evaluated"
    ],
    evidence_gathering: [
      "Financial documents analyzed",
      "Transaction patterns reviewed",
      "Supporting evidence collected",
      "Detailed testing conducted"
    ],
    review: [
      "Findings documented",
      "Recommendations drafted",
      "Risk assessment updated",
      "Report preparation initiated"
    ],
    completed: [
      "Final report generated",
      "All findings documented",
      "Recommendations provided",
      "Risk mitigation strategies proposed"
    ]
  };

  return accomplishments[status as keyof typeof accomplishments] || [];
};

const AuditProgress = ({ status, getStatusExplanation }: AuditProgressProps) => {
  const progress = getAuditProgress(status);
  const accomplishments = getAuditAccomplishments(status);

  return (
    <div className="space-y-4">
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

      <div className={`px-3 py-1 rounded-full text-sm inline-block ${
        status === 'completed' ? 'bg-green-100 text-green-800' :
        status === 'review' ? 'bg-orange-100 text-orange-800' :
        status === 'evidence_gathering' ? 'bg-purple-100 text-purple-800' :
        status === 'control_evaluation' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {status?.replace('_', ' ')}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Phase Accomplishments:</h4>
        <ul className="list-disc pl-5 space-y-1">
          {accomplishments.map((item, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AuditProgress;