import { AuditCard } from "./AuditCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface AuditListProps {
  audits: any[];
  isLoading: boolean;
  onNewAudit: () => void;
  onDeleteClick: (id: string) => void;
}

export const AuditList = ({ audits, isLoading, onNewAudit, onDeleteClick }: AuditListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!audits?.length) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Audits Yet</h3>
        <p className="text-muted-foreground mb-4">
          Start your first audit to track and manage your financial reviews
        </p>
        <Button onClick={onNewAudit}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Audit
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {audits.map((audit) => (
        <AuditCard 
          key={audit.id} 
          audit={audit} 
          onDeleteClick={onDeleteClick}
        />
      ))}
    </div>
  );
};