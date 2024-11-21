import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/integrations/supabase/types";
import { TaxSummaryCard } from "./tax-summary/TaxSummaryCard";
import { calculateTaxes } from "./tax-summary/TaxCalculationUtils";
import { DollarSign, MapPin, Building, Calculator } from "lucide-react";
import { useState } from "react";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaxSummaryProps {
  audit?: any;
}

type TaxAnalysisResponse = Database['public']['Tables']['tax_analysis']['Row'] & {
  recommendations?: {
    total_revenue?: number;
    total_deductions?: number;
    taxable_income?: number;
    effective_rate?: number;
    business_type?: 'sole_proprietorship' | 'partnership' | 'llc' | 'corporation';
    items?: any[];
  } | null;
};

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('corporation');
  const [selectedState, setSelectedState] = useState<string>('California');

  const { data: taxAnalysis, isError } = useQuery<TaxAnalysisResponse>({
    queryKey: ['tax-analysis', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('tax_analysis')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Using maybeSingle instead of single to handle no rows case

        if (error) throw error;
        return data as TaxAnalysisResponse;
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching tax analysis",
          description: error.message
        });
        return null;
      }
    },
    enabled: !!session?.user?.id
  });

  const {
    totalAmount = 0,
    deductions = 0,
    estimatedTax = 0,
    effectiveRate = 0,
    taxableIncome = 0,
    minimumTax = 800
  } = calculateTaxes(taxAnalysis, audit) || {};

  if (isError) {
    return <div>Error loading tax summary</div>;
  }

  const businessTypes = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'LLC' },
    { value: 'corporation', label: 'Corporation' }
  ];

  const states = [
    { value: 'California', label: 'California' },
    { value: 'New York', label: 'New York' },
    { value: 'Texas', label: 'Texas' },
    { value: 'Florida', label: 'Florida' }
  ];

  const handleBusinessTypeChange = async (value: string) => {
    setSelectedBusinessType(value);
    // You can add logic here to update the tax analysis in the database
  };

  const handleStateChange = async (value: string) => {
    setSelectedState(value);
    // You can add logic here to update the tax analysis in the database
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Select value={selectedBusinessType} onValueChange={handleBusinessTypeChange}>
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
        </div>

        <TaxSummaryCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${totalAmount.toLocaleString()}`}
          className="text-primary"
        />

        <TaxSummaryCard
          icon={DollarSign}
          title="Deductions"
          value={`$${deductions.toLocaleString()}`}
          className="text-green-500"
        />

        <div className="col-span-1">
          <Select value={selectedState} onValueChange={handleStateChange}>
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
        </div>

        <TaxSummaryCard
          icon={DollarSign}
          title="Taxable Income"
          value={`$${taxableIncome.toLocaleString()}`}
          className="text-yellow-500"
        />

        <TaxSummaryCard
          icon={Calculator}
          title="Minimum Tax"
          value={`$${minimumTax.toLocaleString()}`}
          className="text-purple-500"
        />

        <TaxSummaryCard
          icon={DollarSign}
          title="Estimated Tax"
          value={`$${estimatedTax.toLocaleString()}`}
          className="text-red-500"
        />

        <TaxSummaryCard
          icon={DollarSign}
          title="Effective Rate"
          value={`${effectiveRate.toFixed(2)}%`}
          className="text-indigo-500"
        />
      </div>
    </div>
  );
};

export default TaxSummaryTab;