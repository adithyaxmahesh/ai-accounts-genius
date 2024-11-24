import { Card } from "@/components/ui/card";
import { Building, MapPin } from "lucide-react";

interface TaxSummaryHeaderProps {
  selectedState: string;
  selectedBusinessType: string;
}

export const TaxSummaryHeader = ({
  selectedState,
  selectedBusinessType,
}: TaxSummaryHeaderProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-background via-background to-muted/20 border-none shadow-xl">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Tax Summary Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <span className="text-sm text-muted-foreground block">State</span>
              <span className="font-medium">{selectedState}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-secondary/10 to-secondary/5">
            <Building className="h-5 w-5 text-secondary" />
            <div>
              <span className="text-sm text-muted-foreground block">Business Type</span>
              <span className="font-medium">{selectedBusinessType.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};