import { Building, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <>
      <div className="glass-card p-4 hover-scale">
        <Select value={selectedBusinessType} onValueChange={onBusinessTypeChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <SelectValue placeholder="Select business type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card p-4 hover-scale">
        <Select value={selectedState} onValueChange={onStateChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <SelectValue placeholder="Select state" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};