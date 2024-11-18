import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface EmptyAuditStateProps {
  onCreateAudit: () => void;
  isCreating: boolean;
}

const EmptyAuditState = ({ onCreateAudit, isCreating }: EmptyAuditStateProps) => {
  return (
    <Card className="p-8 text-center">
      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">No Audits Yet</h3>
      <p className="text-muted-foreground mb-4">
        Start your first audit to track and manage your financial reviews
      </p>
      <Button onClick={onCreateAudit} disabled={isCreating}>
        <Plus className="mr-2 h-4 w-4" />
        Create Your First Audit
      </Button>
    </Card>
  );
};

export default EmptyAuditState;