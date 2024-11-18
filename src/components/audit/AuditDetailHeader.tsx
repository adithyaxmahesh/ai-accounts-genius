import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuditItemCard from "@/components/AuditItemCard";

interface AuditDetailHeaderProps {
  audit: any;
  flaggedItems: any[];
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
}

const AuditDetailHeader = ({ 
  audit, 
  flaggedItems, 
  selectedItemId, 
  setSelectedItemId 
}: AuditDetailHeaderProps) => {
  const navigate = useNavigate();

  const getFraudInsights = (item: any) => {
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

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/audit')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Audits
      </Button>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{audit?.title}</h1>
      </div>

      {flaggedItems.length > 0 && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Flagged Items Requiring Attention ({flaggedItems.length})
          </h2>
          <div className="space-y-4">
            {flaggedItems.map((item) => (
              <AuditItemCard 
                key={item.id}
                item={item}
                insights={getFraudInsights(item)}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDetailHeader;