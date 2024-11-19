import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type TaxCode = Tables<"tax_codes">;

interface WriteOffFormFieldsProps {
  states: string[] | undefined;
  categories: string[] | undefined;
  taxCodes: TaxCode[] | undefined;
  selectedState: string;
  selectedCategory: string;
  newWriteOff: {
    amount: string;
    description: string;
    date: string;
    taxCodeId: string;
  };
  setSelectedState: (state: string) => void;
  setSelectedCategory: (category: string) => void;
  setNewWriteOff: (writeOff: any) => void;
  isLoading?: boolean;
}

export const WriteOffFormFields = ({
  states,
  categories,
  taxCodes,
  selectedState,
  selectedCategory,
  newWriteOff,
  setSelectedState,
  setSelectedCategory,
  setNewWriteOff,
  isLoading = false,
}: WriteOffFormFieldsProps) => {
  if (isLoading) {
    return <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">State</label>
        <Select
          value={selectedState}
          onValueChange={setSelectedState}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states?.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedState && (
        <div>
          <label className="text-sm font-medium">Expense Category</label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedCategory && (
        <div>
          <label className="text-sm font-medium">Tax Code</label>
          <Select
            value={newWriteOff.taxCodeId}
            onValueChange={(value) => setNewWriteOff(prev => ({
              ...prev,
              taxCodeId: value
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tax code" />
            </SelectTrigger>
            <SelectContent>
              {taxCodes?.map((code) => (
                <SelectItem key={code.id} value={code.id}>
                  {code.code} - {code.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Amount</label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={newWriteOff.amount}
          onChange={(e) => setNewWriteOff(prev => ({
            ...prev,
            amount: e.target.value
          }))}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          placeholder="Enter description"
          value={newWriteOff.description}
          onChange={(e) => setNewWriteOff(prev => ({
            ...prev,
            description: e.target.value
          }))}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Date</label>
        <Input
          type="date"
          value={newWriteOff.date}
          onChange={(e) => setNewWriteOff(prev => ({
            ...prev,
            date: e.target.value
          }))}
        />
      </div>
    </div>
  );
};