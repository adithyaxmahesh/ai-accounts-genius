import { Card } from "@/components/ui/card";
import { Info, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface FraudInsight {
  description: string;
  severity: 'high' | 'medium' | 'low';
  amount?: number;
}

interface AuditItemProps {
  item: {
    id: string;
    category: string;
    description: string;
    amount: number;
    status: string;
  };
  insights: FraudInsight[];
  isSelected: boolean;
  onSelect: () => void;
}

const getFlagExplanation = (status: string) => {
  switch (status) {
    case 'flagged':
      return "This item requires immediate attention due to potential irregularities";
    case 'approved':
      return "This item has been reviewed and approved";
    case 'pending':
      return "This item is awaiting review";
    default:
      return "Status unknown";
  }
};

const AuditItemCard = ({ item, insights, isSelected, onSelect }: AuditItemProps) => {
  const hasSuspiciousActivity = insights.some(insight => insight.severity === 'high');

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all ${
        hasSuspiciousActivity ? 'border-red-500 border-2' : ''
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div>
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{item.category}</p>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getFlagExplanation(item.status)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${item.amount?.toLocaleString()}</p>
          <p className={`text-sm ${
            item.status === 'approved' ? 'text-green-600' :
            item.status === 'flagged' ? 'text-red-600 font-semibold' :
            'text-muted-foreground'
          }`}>
            {item.status}
          </p>
        </div>
      </div>

      {isSelected && insights.length > 0 && (
        <div className="mt-4 space-y-2">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-3 rounded-md ${
                insight.severity === 'high' ? 'bg-red-50 text-red-700' :
                insight.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                'bg-blue-50 text-blue-700'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="text-sm">{insight.description}</p>
                  {insight.amount && (
                    <p className="text-sm font-semibold mt-1">
                      Amount: ${insight.amount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AuditItemCard;