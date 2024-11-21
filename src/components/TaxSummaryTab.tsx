import { Card } from "@/components/ui/card";
import { DollarSign, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TaxSummaryProps {
  audit: any;
}

const TaxSummaryTab = ({ audit }: TaxSummaryProps) => {
  const { toast } = useToast();

  // Fetch the latest tax analysis for this audit
  const { data: taxAnalysis } = useQuery({
    queryKey: ['tax-analysis', audit?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_analysis')
        .select('*')
        .eq('user_id', audit?.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        toast({
          title: "Error fetching tax analysis",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
    enabled: !!audit?.user_id,
  });

  const calculateTaxes = () => {
    if (!audit?.audit_items) return { 
      totalAmount: 0, 
      estimatedTax: 0, 
      deductions: 0,
      state: taxAnalysis?.jurisdiction || 'California',
      effectiveRate: 0,
      taxableIncome: 0
    };
    
    // Calculate total from audit items
    const totalAmount = audit.audit_items.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // Get approved write-offs as deductions
    const deductions = audit.write_offs?.reduce((sum, item) => {
      if (item.status === 'approved' && item.tax_codes) {
        return sum + (item.amount || 0);
      }
      return sum;
    }, 0) || 0;
    
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

  const { totalAmount, deductions, estimatedTax, state, effectiveRate, taxableIncome } = calculateTaxes();

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue-700 flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Tax Summary
          </h2>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {state}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold truncate">${totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deductions</p>
            <p className="text-xl font-bold text-green-600 truncate">-${deductions.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Taxable Income</p>
            <p className="text-xl font-bold text-purple-600 truncate">${taxableIncome.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated Tax Due</p>
            <p className="text-xl font-bold text-blue-600 truncate">${estimatedTax.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Effective Tax Rate</p>
            <p className="text-xl font-bold text-orange-600 truncate">{effectiveRate.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">State</p>
            <p className="text-xl font-bold text-gray-600 truncate">{state}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TaxSummaryTab;