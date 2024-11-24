import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface TaxCode {
  id: string;
  code: string;
  description: string;
  expense_category: string;
  deduction_type: string;
}

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
  "Wisconsin", "Wyoming"
];

const TaxCodesList = () => {
  const [selectedState, setSelectedState] = useState("California");

  const { data: taxCodes } = useQuery<TaxCode[]>({
    queryKey: ['taxCodes', selectedState],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_codes')
        .select('*')
        .eq('state', selectedState)
        .order('expense_category');
      
      if (error) throw error;
      return data;
    }
  });

  const groupedTaxCodes = taxCodes?.reduce((acc, code) => {
    if (!acc[code.expense_category]) {
      acc[code.expense_category] = [];
    }
    acc[code.expense_category].push(code);
    return acc;
  }, {} as Record<string, TaxCode[]>);

  const getDeductionAdvice = (category: string) => {
    const adviceMap: Record<string, string> = {
      'Transportation': 'Track mileage, keep maintenance receipts, and document business use percentage.',
      'Office': 'Measure home office space, keep utility bills, and document exclusive business use.',
      'Services': 'Maintain invoices and contracts, document business purpose for each service.',
      'Marketing': 'Keep all advertising receipts and track campaign performance metrics.',
      'Equipment': 'Document purchase dates, keep receipts, and track depreciation schedules.',
      'Travel': 'Keep detailed logs of business purposes, save all receipts, and separate personal expenses.',
      'Education': 'Document relevance to business, keep certification records and course materials.',
      'Insurance': 'Maintain policy documents and proof of payments, document business relationship.'
    };
    return adviceMap[category] || 'Keep detailed records and documentation for all expenses.';
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tax Codes Guide</h2>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <Accordion type="single" collapsible className="space-y-4">
          {groupedTaxCodes && Object.entries(groupedTaxCodes).map(([category, codes]) => (
            <AccordionItem key={category} value={category} className="border rounded-lg p-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{getDeductionAdvice(category)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-2">
                  {codes.map((code) => (
                    <div key={code.id} className="border-l-2 border-primary pl-4">
                      <h4 className="font-medium">{code.description}</h4>
                      <p className="text-sm text-muted-foreground">Code: {code.code}</p>
                      <p className="text-sm text-muted-foreground">Type: {code.deduction_type}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </Card>
  );
};

export default TaxCodesList;