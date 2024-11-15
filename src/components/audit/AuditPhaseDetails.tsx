import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuditPhaseDetailsProps {
  status: string;
  currentActions: string[];
  completedTasks: string[];
}

const getPhaseDetails = (status: string) => {
  switch (status) {
    case 'planning':
      return {
        title: "Planning Phase",
        description: "Defining audit scope and identifying key risk areas",
        actions: [
          "Analyzing transaction patterns",
          "Reviewing document history",
          "Identifying potential risk areas",
          "Setting audit objectives"
        ]
      };
    case 'control_evaluation':
      return {
        title: "Control Evaluation",
        description: "Assessing internal controls and procedures",
        actions: [
          "Evaluating internal control systems",
          "Identifying control weaknesses",
          "Assessing risk management procedures",
          "Reviewing compliance measures"
        ]
      };
    case 'evidence_gathering':
      return {
        title: "Evidence Gathering",
        description: "Collecting and analyzing financial documentation",
        actions: [
          "Processing uploaded documents",
          "Analyzing transaction records",
          "Verifying supporting documentation",
          "Conducting detailed testing"
        ]
      };
    case 'review':
      return {
        title: "Review Phase",
        description: "Evaluating findings and preparing recommendations",
        actions: [
          "Analyzing collected evidence",
          "Documenting findings",
          "Drafting recommendations",
          "Preparing final report"
        ]
      };
    case 'completed':
      return {
        title: "Audit Completed",
        description: "Final report with findings and recommendations",
        actions: [
          "All findings documented",
          "Recommendations provided",
          "Risk assessment completed",
          "Report finalized"
        ]
      };
    default:
      return {
        title: "Unknown Phase",
        description: "Status unknown",
        actions: []
      };
  }
};

const AuditPhaseDetails = ({ status, currentActions, completedTasks }: AuditPhaseDetailsProps) => {
  const phaseInfo = getPhaseDetails(status);

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{phaseInfo.title}</h3>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{phaseInfo.description}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Current Actions:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {phaseInfo.actions.map((action, index) => (
              <li 
                key={index}
                className={`text-sm ${
                  completedTasks.includes(action) 
                    ? 'text-green-600 line-through' 
                    : currentActions.includes(action)
                    ? 'text-blue-600'
                    : 'text-muted-foreground'
                }`}
              >
                {action}
              </li>
            ))}
          </ul>
        </div>

        {completedTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Completed Tasks:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {completedTasks.map((task, index) => (
                <li key={index} className="text-sm text-green-600">
                  {task}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AuditPhaseDetails;