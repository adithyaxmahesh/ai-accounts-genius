import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import AuditItemCard from "@/components/AuditItemCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuditItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  status: string;
}

interface AuditItemsSectionProps {
  auditItems: AuditItem[];
}

const AuditItemsSection = ({ auditItems }: AuditItemsSectionProps) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { data: insights } = useQuery({
    queryKey: ['audit-insights', selectedItemId],
    queryFn: async () => {
      if (!selectedItemId) return [];
      
      const { data, error } = await supabase
        .from('audit_monitoring_alerts')
        .select('*')
        .eq('audit_id', selectedItemId);
      
      if (error) throw error;
      
      return data?.map(alert => ({
        description: alert.details?.description || 'Potential issue detected',
        severity: alert.severity as 'high' | 'medium' | 'low',
        amount: alert.details?.amount
      })) || [];
    },
    enabled: !!selectedItemId
  });

  if (!Array.isArray(auditItems)) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No audit items available
      </p>
    );
  }

  return (
    <div className="relative">
      <TooltipProvider>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold">
            Audit Items ({auditItems.length})
          </h3>
          <Badge variant="outline" className="ml-2">
            {auditItems.filter(item => item.status === 'flagged').length} Flagged
          </Badge>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Individual transactions or records being reviewed</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      
      <div className="space-y-4">
        {auditItems.map((item) => (
          <div key={item.id} className="relative">
            <AuditItemCard 
              item={item}
              insights={selectedItemId === item.id ? insights || [] : []}
              isSelected={selectedItemId === item.id}
              onSelect={() => setSelectedItemId(item.id === selectedItemId ? null : item.id)}
            />
          </div>
        ))}
        {auditItems.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No audit items added yet
          </p>
        )}
      </div>
    </div>
  );
};

export default AuditItemsSection;