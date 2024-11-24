import { Building, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface TaxSummarySelectsProps {
  selectedBusinessType: string;
  selectedState: string;
  onBusinessTypeChange: (value: string) => void;
  onStateChange: (value: string) => void;
}

export const businessTypes = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' }
];

export const states = [
  { value: 'California', label: 'California' },
  { value: 'New York', label: 'New York' },
  { value: 'Texas', label: 'Texas' },
  { value: 'Florida', label: 'Florida' }
];

export const TaxSummarySelects = ({
  selectedBusinessType,
  selectedState,
  onBusinessTypeChange,
  onStateChange,
}: TaxSummarySelectsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Business Type</h3>
        </div>
        <Select value={selectedBusinessType} onValueChange={onBusinessTypeChange}>
          <SelectTrigger className="w-full bg-gradient-to-r from-background to-muted/20 border-primary/20">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem 
                key={type.value} 
                value={type.value}
                className="hover:bg-primary/10"
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">State</h3>
        </div>
        <Select value={selectedState} onValueChange={onStateChange}>
          <SelectTrigger className="w-full bg-gradient-to-r from-background to-muted/20 border-primary/20">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem 
                key={state.value} 
                value={state.value}
                className="hover:bg-primary/10"
              >
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};