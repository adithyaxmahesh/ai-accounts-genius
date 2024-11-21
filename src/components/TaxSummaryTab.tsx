import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/integrations/supabase/types";
import { TaxSummaryCard } from "./tax-summary/TaxSummaryCard";
import { calculateTaxes } from "./tax-summary/TaxCalculationUtils";
import { DollarSign, MapPin, Building, Calculator } from "lucide-react";

interface TaxSummaryProps {
  audit: any;
}

type TaxAnalysisResponse = Database['public']['Tables']['tax_analysis']['Row'] & {
  recommendations: {
    total_revenue: number;
    total_deductions: number;
    taxable_income: number;
    effective_rate: number;
    business_type?: 'sole_proprietorship' | 'partnership' | 'llc' | 'corporation';
    items: any[];
  } | null;
};

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const { session } = useAuth();

  const { data: taxAnalysis } = useQuery<TaxAnalysisResponse>({
    queryKey: ['tax-analysis', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching tax analysis:', error);
        return null;
      }

      return data as TaxAnalysisResponse;
    },
    enabled: !!session?.user.id
  });

  const {
    totalAmount,
    deductions,
    estimatedTax,
    state,
    effectiveRate,
    taxableIncome,
    businessType,
    minimumTax
  } = calculateTaxes(taxAnalysis, audit);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TaxSummaryCard
          icon={Building}
          title="Business Type"
          value={businessType?.replace('_', ' ') || 'Corporation'}
          className="text-primary"
        />
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
        <TaxSummaryCard
          icon={MapPin}
          title="State"
          value={state}
          className="text-blue-500"
        />
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