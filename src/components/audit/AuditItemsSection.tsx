import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AuditItemCard from "@/components/AuditItemCard";
import AuditFraudInsights from "./AuditFraudInsights";

interface AuditItemsSectionProps {
  auditItems: any[];
}

const AuditItemsSection = ({ auditItems }: AuditItemsSectionProps) => {
  const [showFraudInsights, setShowFraudInsights] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const getFraudInsights = (itemId: string) => {
    const item = auditItems.find(i => i.id === itemId);
    if (!item) return [];

    const insights = [];
    
    if (item.status === 'flagged') {
      insights.push({
        description: 'Transaction has been flagged for suspicious activity',
        severity: 'high',
        amount: item.amount
      });
    }

    if (item.amount > 10000) {
      insights.push({
        description: 'Large transaction amount detected',
        severity: 'medium',
        amount: item.amount
      });
    }

    return insights;
  };

  const handleSearchInsights = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowFraudInsights(true);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold">
          Audit Items ({auditItems?.length || 0})
        </h3>
        <Badge variant="outline" className="ml-2">
          {auditItems?.filter(item => item.status === 'flagged').length || 0} Flagged
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
      
      <div className="space-y-4">
        {auditItems?.map((item) => (
          <div key={item.id} className="relative">
            <AuditItemCard 
              item={item} 
              onSearchInsights={() => handleSearchInsights(item.id)}
            />
            <AuditFraudInsights
              insights={getFraudInsights(item.id)}
              isVisible={showFraudInsights && selectedItemId === item.id}
            />
          </div>
        ))}
        {(!auditItems || auditItems.length === 0) && (
          <p className="text-muted-foreground text-center py-4">
            No audit items added yet
          </p>
        )}
      </div>
    </div>
  );
};

export default AuditItemsSection;