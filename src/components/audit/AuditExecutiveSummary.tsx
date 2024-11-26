import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Calendar, Users, Target, ClipboardList, Info } from "lucide-react";

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

  const getPhaseDescription = (description: string) => {
    if (description.includes("Initial audit")) {
      return (
        <div className="space-y-2">
          <p className="text-muted-foreground">{description}</p>
          <div className="pl-4 border-l-2 border-primary/20 space-y-2">
            <p className="text-sm">• Establishing audit framework and methodology</p>
            <p className="text-sm">• Identifying key risk areas and control points</p>
            <p className="text-sm">• Developing comprehensive audit program</p>
            <p className="text-sm">• Resource allocation and timeline planning</p>
            <p className="text-sm">• Setting materiality thresholds</p>
          </div>
        </div>
      );
    }
    return <p className="text-muted-foreground">{description}</p>;
  };

  return (
    <div className="space-y-6">
      {description && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Executive Summary</h3>
          </div>
          {getPhaseDescription(description)}
          
          {risk_level && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium">Risk Assessment:</span>
              <Badge variant="outline" className={getRiskBadgeColor(risk_level)}>
                {risk_level.toUpperCase()}
              </Badge>
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Based on initial risk assessment and historical data
              </span>
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
              <h4 className="font-medium mb-2">Primary Objective</h4>
              <p className="text-muted-foreground">{audit_objective}</p>
            </div>
          )}
          
          {scope && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Scope of Review</h4>
              <div className="pl-4 border-l-2 border-primary/20">
                <p className="text-muted-foreground">{scope}</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>• Review Period: Specified timeframe for examination</p>
                  <p>• Documentation: Required records and evidence</p>
                  <p>• Systems: Relevant systems and processes</p>
                  <p>• Departments: Areas under review</p>
                </div>
              </div>
            </div>
          )}

          {(start_date || end_date) && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Timeline</h4>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {start_date && (
                  <div>
                    <span className="font-medium">Start Date:</span>{" "}
                    {new Date(start_date).toLocaleDateString()}
                  </div>
                )}
                {end_date && (
                  <div>
                    <span className="font-medium">Target Completion:</span>{" "}
                    {new Date(end_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {stakeholders && stakeholders.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Key Stakeholders & Responsibilities</h3>
          </div>
          <div className="space-y-3">
            {stakeholders.map((stakeholder: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  {stakeholder}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {index === 0 ? "Primary Contact & Oversight" : "Supporting Role & Review"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {key_findings && key_findings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Preliminary Findings & Observations</h3>
          </div>
          <ul className="space-y-3">
            {key_findings.map((finding, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <div>
                  <p className="text-muted-foreground">{finding}</p>
                  {index === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Impact Level: {risk_level === 'high' ? 'Significant' : risk_level === 'medium' ? 'Moderate' : 'Minor'}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AuditExecutiveSummary;