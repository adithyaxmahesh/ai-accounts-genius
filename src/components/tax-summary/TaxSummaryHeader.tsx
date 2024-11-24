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
    <Card className="p-4 bg-muted/50">
      <h3 className="text-lg font-semibold mb-4">Current Tax Configuration</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">State:</span>
          <span className="font-medium">{selectedState}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Business Type:</span>
          <span className="font-medium">{selectedBusinessType.replace('_', ' ')}</span>
        </div>
      </div>
    </Card>
  );
};