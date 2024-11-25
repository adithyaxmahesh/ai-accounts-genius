import { Badge } from "@/components/ui/badge";

interface AuditExecutiveSummaryProps {
  description?: string;
  audit_objective?: string;
  stakeholders?: string[];
}

const AuditExecutiveSummary = ({ 
  description, 
  audit_objective, 
  stakeholders 
}: AuditExecutiveSummaryProps) => {
  if (!description && !audit_objective) return null;

  return (
    <>
      {description && (
        <div className="bg-muted/50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      )}

      {audit_objective && (
        <div className="bg-muted/50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Audit Scope & Objective</h3>
          <p className="text-muted-foreground">{audit_objective}</p>
          {stakeholders && stakeholders.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Key Stakeholders</h4>
              <div className="flex flex-wrap gap-2">
                {stakeholders.map((stakeholder: string, index: number) => (
                  <Badge key={index} variant="outline">{stakeholder}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AuditExecutiveSummary;