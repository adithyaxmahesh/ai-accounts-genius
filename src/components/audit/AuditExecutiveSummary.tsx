import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Calendar, Users, Target, ClipboardList } from "lucide-react";

interface AuditExecutiveSummaryProps {
  description?: string;
  audit_objective?: string;
  stakeholders?: string[];
  start_date?: string;
  end_date?: string;
  risk_level?: string;
  scope?: string;
  key_findings?: string[];
}

const AuditExecutiveSummary = ({ 
  description, 
  audit_objective,
  stakeholders,
  start_date,
  end_date,
  risk_level,
  scope,
  key_findings
}: AuditExecutiveSummaryProps) => {
  if (!description && !audit_objective) return null;

  const getRiskBadgeColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {description && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Executive Summary</h3>
          </div>
          <p className="text-muted-foreground">{description}</p>
          
          {risk_level && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge variant="outline" className={getRiskBadgeColor(risk_level)}>
                {risk_level.toUpperCase()}
              </Badge>
            </div>
          )}
        </Card>
      )}

      {(audit_objective || scope) && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Audit Scope & Objective</h3>
          </div>
          
          {audit_objective && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Objective</h4>
              <p className="text-muted-foreground">{audit_objective}</p>
            </div>
          )}
          
          {scope && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Scope</h4>
              <p className="text-muted-foreground">{scope}</p>
            </div>
          )}

          {(start_date || end_date) && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Timeline</h4>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {start_date && <span>Start: {new Date(start_date).toLocaleDateString()}</span>}
                {end_date && <span>End: {new Date(end_date).toLocaleDateString()}</span>}
              </div>
            </div>
          )}
        </Card>
      )}

      {stakeholders && stakeholders.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Key Stakeholders</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stakeholders.map((stakeholder: string, index: number) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                {stakeholder}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {key_findings && key_findings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Key Findings</h3>
          </div>
          <ul className="space-y-2">
            {key_findings.map((finding, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span className="text-muted-foreground">{finding}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AuditExecutiveSummary;