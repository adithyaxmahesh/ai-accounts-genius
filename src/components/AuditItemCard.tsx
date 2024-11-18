import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuditItemProps {
  item: {
    id: string;
    category: string;
    description: string;
    amount: number;
    status: string;
  };
  onSearchInsights?: () => void;
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

const AuditItemCard = ({ item, onSearchInsights }: AuditItemProps) => {
  return (
    <Card 
      className={`p-4 ${
        item.status === 'flagged' ? 'border-red-500 border-2' : ''
      }`}
      onClick={onSearchInsights}
    >
      <div className="flex justify-between items-start">
        <div>
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
      {item.status === 'flagged' && (
        <div className="mt-2 p-2 bg-red-50 rounded-md">
          <p className="text-sm text-red-700">
            This item has been flagged for review due to potential irregularities. 
            Please check the transaction details and supporting documentation.
          </p>
        </div>
      )}
    </Card>
  );
};

export default AuditItemCard;