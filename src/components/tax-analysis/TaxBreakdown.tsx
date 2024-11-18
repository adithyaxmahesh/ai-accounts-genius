import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, AlertTriangle } from "lucide-react";

interface TaxBreakdownProps {
  analysis: any;
}

export const TaxBreakdown = ({ analysis }: TaxBreakdownProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Tax Analysis Breakdown</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {analysis.recommendations?.items?.map((item: any, index: number) => (
            <div key={index} className="p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                {item.status === 'approved' ? (
                  <Check className="h-5 w-5 text-green-500 mt-1" />
                ) : item.status === 'rejected' ? (
                  <X className="h-5 w-5 text-red-500 mt-1" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                )}
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Amount: ${item.amount?.toLocaleString()}
                  </p>
                  {item.rule && (
                    <p className="text-sm text-muted-foreground">
                      IRS Rule: {item.rule}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};