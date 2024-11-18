import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, Check, ClipboardList, Shield, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStatusExplanation } from "@/utils/auditUtils";
import StatusIcon from "./StatusIcon";

interface AuditCardProps {
  audit: {
    id: string;
    title: string;
    status: string;
    description: string;
    created_at: string;
    risk_level: string;
    audit_items?: any[];
  };
  onDeleteClick: (id: string) => void;
}

const AuditCard = ({ audit, onDeleteClick }: AuditCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow glass-card">
      <div className="flex justify-between items-start mb-4">
        <StatusIcon status={audit.status} />
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/audit/${audit.id}`)}
            className="hover:bg-secondary"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(audit.id);
            }}
            className="hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{audit.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {audit.description || getStatusExplanation(audit.status)}
      </p>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span className="flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Created: {new Date(audit.created_at).toLocaleDateString()}
        </span>
        <span className="flex items-center">
          {audit.risk_level === 'high' ? (
            <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
          ) : audit.status === 'completed' ? (
            <Check className="h-4 w-4 text-green-500 mr-1" />
          ) : null}
          {audit.risk_level}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="flex items-center">
            <ClipboardList className="h-4 w-4 mr-1" />
            Items: {audit.audit_items?.length || 0}
          </span>
          <span className={`flex items-center ${
            audit.risk_level === 'high' ? 'text-red-600' :
            audit.risk_level === 'medium' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            <Shield className="h-4 w-4 mr-1" />
            Risk Level: {audit.risk_level}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default AuditCard;