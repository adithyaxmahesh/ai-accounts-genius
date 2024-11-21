import { Card } from "@/components/ui/card";
import { DollarSign, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Database } from "@/integrations/supabase/types";

interface TaxSummaryProps {
  audit: any;
}

type TaxAnalysisResponse = Database['public']['Tables']['tax_analysis']['Row'] & {
  recommendations: {
    total_revenue: number;
    total_deductions: number;
    taxable_income: number;
    effective_rate: number;
    items: any[];
  } | null;
};

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const { toast } = useToast();
  const { session } = useAuth();

  // Fetch the latest tax analysis
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

  const calculateTaxes = () => {
    // If we have tax analysis data, use that
    if (taxAnalysis?.recommendations) {
      return {
        totalAmount: taxAnalysis.recommendations.total_revenue || 0,
        deductions: taxAnalysis.recommendations.total_deductions || 0,
        estimatedTax: taxAnalysis.tax_impact || 0,
        state: taxAnalysis.jurisdiction || 'California',
        effectiveRate: taxAnalysis.recommendations.effective_rate || 0,
        taxableIncome: taxAnalysis.recommendations.taxable_income || 0
      };
    }

    // Fallback calculations if no analysis is available
    if (!audit?.audit_items) {
      return {
        totalAmount: 0,
        estimatedTax: 0,
        deductions: 0,
        state: 'California',
        effectiveRate: 0,
        taxableIncome: 0
      };
    }

    const totalAmount = audit.audit_items.reduce((sum: number, item: any) => {
      if (item.status === 'approved' && !item.category.toLowerCase().includes('deduction')) {
        return sum + (Number(item.amount) || 0);
      }
      return sum;
    }, 0);

    const deductions = audit.audit_items.reduce((sum: number, item: any) => {
      if (item.status === 'approved' && item.category.toLowerCase().includes('deduction')) {
        return sum + (Number(item.amount) || 0);
      }
      return sum;
    }, 0);
    
    const taxableIncome = Math.max(0, totalAmount - deductions);
    const estimatedTax = taxAnalysis?.tax_impact || 0;
    const effectiveRate = totalAmount > 0 ? ((estimatedTax / totalAmount) * 100) : 0;
    
    return {
      totalAmount,
      deductions,
      estimatedTax,
      state: taxAnalysis?.jurisdiction || 'California',
      effectiveRate,
      taxableIncome
    };
  };

  const {
    totalAmount,
    deductions,
    estimatedTax,
    state,
    effectiveRate,
    taxableIncome
  } = calculateTaxes();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <DollarSign className="h-8 w-8 mb-4 text-primary" />
          <h3 className="text-lg font-semibold">Total Amount</h3>
          <p className="text-3xl font-bold">${totalAmount.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <DollarSign className="h-8 w-8 mb-4 text-green-500" />
          <h3 className="text-lg font-semibold">Deductions</h3>
          <p className="text-3xl font-bold text-green-500">${deductions.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <MapPin className="h-8 w-8 mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold">State</h3>
          <p className="text-3xl font-bold text-blue-500">{state}</p>
        </Card>

        <Card className="p-6">
          <DollarSign className="h-8 w-8 mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold">Taxable Income</h3>
          <p className="text-3xl font-bold text-yellow-500">${taxableIncome.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <DollarSign className="h-8 w-8 mb-4 text-red-500" />
          <h3 className="text-lg font-semibold">Estimated Tax</h3>
          <p className="text-3xl font-bold text-red-500">${estimatedTax.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <DollarSign className="h-8 w-8 mb-4 text-purple-500" />
          <h3 className="text-lg font-semibold">Effective Rate</h3>
          <p className="text-3xl font-bold text-purple-500">{effectiveRate.toFixed(2)}%</p>
        </Card>
      </div>
    </div>
  );
};

export default TaxSummaryTab;