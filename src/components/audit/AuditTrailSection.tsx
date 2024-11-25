import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Info, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface AuditTrailProps {
  auditId: string;
}

const AuditTrailSection = ({ auditId }: AuditTrailProps) => {
  const { data: auditTrail, isLoading } = useQuery({
    queryKey: ['audit-trail', auditId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_trail')
        .select('*')
        .eq('audit_id', auditId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Audit Trail</h3>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Chronological record of audit activities and changes</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <Card className="divide-y">
        {auditTrail && auditTrail.length > 0 ? (
          auditTrail.map((entry) => (
            <div key={entry.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{entry.action_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.details && typeof entry.details === 'object' 
                      ? JSON.stringify(entry.details)
                      : String(entry.details)
                    }
                  </p>
                </div>
                <time className="text-sm text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </time>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No audit trail entries yet
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditTrailSection;