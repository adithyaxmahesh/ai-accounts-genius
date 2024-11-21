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
    <>
      <Card className="p-6">
        <Building className="h-8 w-8 mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-4">Business Type</h3>
        <Select value={selectedBusinessType} onValueChange={onBusinessTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-6">
        <MapPin className="h-8 w-8 mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-4">State</h3>
        <Select value={selectedState} onValueChange={onStateChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>
    </>
  );
};