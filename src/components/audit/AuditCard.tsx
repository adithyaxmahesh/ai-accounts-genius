import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StatusIcon from "./StatusIcon";

interface AuditCardProps {
  audit: {
    id: string;
    title: string;
    status: string;
    risk_level?: string;
    created_at: string;
    description?: string;
  };
  getStatusExplanation: (status: string) => string;
}

const AuditCard = ({ audit, getStatusExplanation }: AuditCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer glass-card"
      onClick={() => navigate(`/audit/${audit.id}`)}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{audit.title}</h3>
          {audit.description && (
            <p className="text-sm text-muted-foreground">{audit.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon status={audit.status} />
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{getStatusExplanation(audit.status)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Created: {new Date(audit.created_at).toLocaleDateString()}
        </div>
        {audit.risk_level && (
          <div className={`px-2 py-1 rounded-full text-xs ${
            audit.risk_level === 'high' ? 'bg-red-100 text-red-800' :
            audit.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {audit.risk_level} risk
          </div>
        )}
      </div>
    </Card>
  );
};

export default AuditCard;