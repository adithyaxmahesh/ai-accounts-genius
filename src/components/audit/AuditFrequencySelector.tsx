import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface AuditFrequencySelectorProps {
  onFrequencyChange: (frequency: string) => void;
  onCustomDatesChange: (dates: { start: Date | undefined; end: Date | undefined }) => void;
  onYearsChange: (years: number[]) => void;
}

export const AuditFrequencySelector = ({
  onFrequencyChange,
  onCustomDatesChange,
  onYearsChange,
}: AuditFrequencySelectorProps) => {
  const [frequency, setFrequency] = useState("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    onFrequencyChange(value);

    // Reset dates when changing frequency
    if (value !== "custom") {
      setStartDate(undefined);
      setEndDate(undefined);
      onCustomDatesChange({ start: undefined, end: undefined });
    }
  };

  const handleYearSelect = (year: number) => {
    const newYears = selectedYears.includes(year)
      ? selectedYears.filter(y => y !== year)
      : [...selectedYears, year];
    setSelectedYears(newYears);
    onYearsChange(newYears);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-4">
      <Select value={frequency} onValueChange={handleFrequencyChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
          <SelectItem value="quarterly">Quarterly</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {frequency === "yearly" && (
        <div className="flex flex-wrap gap-2">
          {years.map(year => (
            <Button
              key={year}
              variant={selectedYears.includes(year) ? "default" : "outline"}
              onClick={() => handleYearSelect(year)}
              className="w-24"
            >
              {year}
            </Button>
          ))}
        </div>
      )}

      {frequency === "custom" && (
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  onCustomDatesChange({ start: date, end: endDate });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  onCustomDatesChange({ start: startDate, end: date });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};