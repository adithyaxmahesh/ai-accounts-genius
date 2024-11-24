import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface RevenueFiltersProps {
  dateRange: { from: Date | null; to: Date | null };
  category: string;
  onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void;
  onCategoryChange: (category: string) => void;
  onApplyFilters: () => void;
}

export const RevenueFilters = ({
  dateRange,
  category,
  onDateRangeChange,
  onCategoryChange,
  onApplyFilters
}: RevenueFiltersProps) => {
  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div>
        <h4 className="text-sm font-medium mb-2">Date Range</h4>
        <div className="grid grid-cols-2 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? format(dateRange.from, "PPP") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from || undefined}
                onSelect={(date) => onDateRangeChange({ ...dateRange, from: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.to ? format(dateRange.to, "PPP") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to || undefined}
                onSelect={(date) => onDateRangeChange({ ...dateRange, to: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Category</h4>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="services">Services</SelectItem>
            <SelectItem value="investments">Investments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full" onClick={onApplyFilters}>
        Apply Filters
      </Button>
    </div>
  );
};