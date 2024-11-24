import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, X } from "lucide-react";
import { DetailedInsight } from "./types";

interface MetricsDialogProps {
  content: DetailedInsight;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MetricsDialog = ({ content, open, onOpenChange }: MetricsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{content.title}</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-6">
            <p className="text-base text-muted-foreground">{content.description}</p>
            
            {content.metrics && (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(content.metrics).map(([key, value]) => (
                  <div key={key} className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium capitalize mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    {typeof value === 'object' ? (
                      <div className="space-y-2">
                        {Object.entries(value).map(([subKey, subValue]) => (
                          <div key={subKey} className="flex justify-between">
                            <span className="text-sm capitalize">{subKey}</span>
                            <span className="font-medium">{subValue}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-2xl font-bold">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {content.recommendations && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {content.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};