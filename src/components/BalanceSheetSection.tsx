import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BalanceSheetItem {
  id: string;
  name: string;
  amount: number;
  description?: string;
  created_at: string;
  category: string;
  subcategory?: string;
  term?: 'short' | 'long';
}

interface BalanceSheetSectionProps {
  title: string;
  items: BalanceSheetItem[];
  className?: string;
}

const getSubcategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'current-assets': 'bg-green-900/50 text-green-200',
    'non-current-assets': 'bg-emerald-900/50 text-emerald-200',
    'current-liabilities': 'bg-red-900/50 text-red-200',
    'non-current-liabilities': 'bg-rose-900/50 text-rose-200',
    'contributed-capital': 'bg-blue-900/50 text-blue-200',
    'retained-earnings': 'bg-indigo-900/50 text-indigo-200',
  };
  return colors[category.toLowerCase()] || 'bg-slate-800 text-slate-200';
};

export const BalanceSheetSection = ({ title, items, className }: BalanceSheetSectionProps) => {
  // Group items by term (short/long) and then by subcategory
  const groupedItems = items.reduce((acc, item) => {
    const term = item.term || 'other';
    const subcategory = item.subcategory || 'Other';
    if (!acc[term]) {
      acc[term] = {};
    }
    if (!acc[term][subcategory]) {
      acc[term][subcategory] = [];
    }
    acc[term][subcategory].push(item);
    return acc;
  }, {} as { [key: string]: { [key: string]: BalanceSheetItem[] } });

  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <Card className={`p-6 bg-black/40 backdrop-blur-lg border border-white/10 shadow-lg ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <div className="text-2xl font-bold text-foreground bg-black/30 px-4 py-2 rounded-lg">
          ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([term, subcategories]) => (
            <div key={term} className="space-y-4">
              <h3 className="text-lg font-semibold capitalize text-foreground">
                {term === 'short' ? 'Current' : term === 'long' ? 'Non-Current' : term}
              </h3>
              
              {Object.entries(subcategories).map(([subcategory, subcategoryItems]) => (
                <div key={subcategory} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-md font-medium text-foreground">{subcategory}</h4>
                    <Badge variant="secondary" className="bg-primary/20 text-primary-foreground">
                      ${subcategoryItems.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {subcategoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start p-4 bg-black/40 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-white/5 hover:border-white/10 hover:bg-black/50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{item.name}</p>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.description || 'No description available'}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Added on {formatDate(item.created_at)}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Badge 
                            className={getSubcategoryColor(item.category)} 
                            variant="secondary"
                          >
                            {item.category}
                          </Badge>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">${item.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {items.length === 0 && (
        <p className="text-muted-foreground text-center py-4">No items added yet</p>
      )}
    </Card>
  );
};