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
    'current-assets': 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20',
    'non-current-assets': 'bg-green-500/10 text-green-200 border-green-500/20',
    'current-liabilities': 'bg-red-500/10 text-red-200 border-red-500/20',
    'non-current-liabilities': 'bg-rose-500/10 text-rose-200 border-rose-500/20',
    'contributed-capital': 'bg-blue-500/10 text-blue-200 border-blue-500/20',
    'retained-earnings': 'bg-indigo-500/10 text-indigo-200 border-indigo-500/20',
  };
  return colors[category.toLowerCase()] || 'bg-slate-800 text-slate-200 border-slate-700';
};

export const BalanceSheetSection = ({ title, items, className }: BalanceSheetSectionProps) => {
  const groupedItems = items.reduce((acc, item) => {
    const term = item.term || 'other';
    const subcategory = item.subcategory || 'Other';
    if (!acc[term]) acc[term] = {};
    if (!acc[term][subcategory]) acc[term][subcategory] = [];
    acc[term][subcategory].push(item);
    return acc;
  }, {} as { [key: string]: { [key: string]: BalanceSheetItem[] } });

  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <Card className={`glass-card backdrop-blur-xl bg-black/40 border-white/10 ${className}`}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="text-2xl font-bold px-4 py-2 rounded-lg bg-black/60 border border-white/10 text-primary">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([term, subcategories]) => (
              <div key={term} className="space-y-4">
                <h3 className="text-lg font-semibold capitalize text-primary/90">
                  {term === 'short' ? 'Current' : term === 'long' ? 'Non-Current' : term}
                </h3>
                
                {Object.entries(subcategories).map(([subcategory, subcategoryItems]) => (
                  <div key={subcategory} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-md font-medium text-primary/80">{subcategory}</h4>
                      <Badge variant="outline" className="bg-primary/10 border-primary/20">
                        ${subcategoryItems.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-3">
                      {subcategoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="group p-4 rounded-lg transition-all duration-300
                            bg-gradient-to-br from-black/60 to-black/40
                            hover:from-black/70 hover:to-black/50
                            border border-white/5 hover:border-white/10
                            backdrop-blur-lg shadow-lg hover:shadow-xl
                            hover:translate-y-[-2px]"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white/90 group-hover:text-white">
                                  {item.name}
                                </p>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="h-4 w-4 text-primary/70" />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black/90 border-white/10">
                                      <p>{item.description || 'No description available'}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Added on {formatDate(item.created_at)}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Badge className={`${getSubcategoryColor(item.category)}`}>
                                {item.category}
                              </Badge>
                              {item.description && (
                                <p className="text-sm text-white/60">{item.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-white/90">
                                ${item.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-white/60">
                                {formatDate(item.created_at)}
                              </p>
                            </div>
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
          <p className="text-white/60 text-center py-4">No items added yet</p>
        )}
      </div>
    </Card>
  );
};