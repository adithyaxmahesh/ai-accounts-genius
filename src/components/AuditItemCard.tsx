import { Card } from "@/components/ui/card";
import { Info, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface AuditItemProps {
  item: {
    id: string;
    category: string;
    description: string;
    amount: number;
    status: string;
    fraud_score?: number;
    fraud_indicators?: string[];
  };
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

const AuditItemCard = ({ item }: AuditItemProps) => {
  const isFraudSuspicious = item.fraud_score && item.fraud_score > 0.7;
  
  return (
    <Card className={`p-4 ${
      item.status === 'flagged' || isFraudSuspicious ? 'border-red-500 border-2' : ''
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{item.category}</p>
            {isFraudSuspicious && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{getFlagExplanation(item.status)}</p>
                {isFraudSuspicious && (
                  <p className="text-red-500 mt-1">High fraud risk detected!</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${item.amount?.toLocaleString()}</p>
          <p className={`text-sm ${
            item.status === 'approved' ? 'text-green-600' :
            item.status === 'flagged' || isFraudSuspicious ? 'text-red-600 font-semibold' :
            'text-muted-foreground'
          }`}>
            {item.status}
          </p>
        </div>
      </div>
      
      {(item.status === 'flagged' || isFraudSuspicious) && (
        <div className="mt-2 p-2 bg-red-50 rounded-md">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
            <div>
              <p className="text-sm text-red-700 font-medium">
                {item.status === 'flagged' ? 
                  "This item has been flagged for review due to potential irregularities." :
                  "High risk of fraudulent activity detected!"
                }
              </p>
              {item.fraud_indicators && item.fraud_indicators.length > 0 && (
                <ul className="mt-1 list-disc list-inside text-sm text-red-600">
                  {item.fraud_indicators.map((indicator, index) => (
                    <li key={index}>{indicator}</li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-red-700 mt-1">
                Please check the transaction details and supporting documentation.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {isFraudSuspicious && (
        <div className="mt-2">
          <Badge variant="destructive">
            Fraud Score: {Math.round(item.fraud_score! * 100)}%
          </Badge>
        </div>
      )}
    </Card>
  );
};

export default AuditItemCard;