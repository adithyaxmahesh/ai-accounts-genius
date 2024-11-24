import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type TaxAnalysisResponse = Database['public']['Tables']['tax_analysis']['Row'] & {
  recommendations?: {
    total_revenue?: number;
    total_deductions?: number;
    taxable_income?: number;
    effective_rate?: number;
    business_type?: string;
    items?: any[];
  } | null;
};

export const calculateTaxes = async (
  taxAnalysis: TaxAnalysisResponse | undefined | null, 
  audit: any,
  businessType: string,
  state: string
) => {
  // Get total revenue and deductions
  const totalRevenue = taxAnalysis?.recommendations?.total_revenue || 0;
  const totalDeductions = taxAnalysis?.recommendations?.total_deductions || 0;
  const taxableIncome = Math.max(0, totalRevenue - totalDeductions);

  // Get tax brackets for the state and business type
  const { data: taxBrackets } = await supabase
    .from('state_tax_brackets')
    .select('*')
    .eq('state', state)
    .eq('business_type', businessType)
    .order('min_income', { ascending: true });

  let calculatedTax = 0;
  let minimumTax = 800; // Default minimum tax for California corporations

  if (taxBrackets && taxBrackets.length > 0) {
    // Special handling for different business types
    switch (businessType) {
      case 'corporation':
        // Corporations typically have a flat rate
        calculatedTax = taxableIncome * taxBrackets[0].rate;
        break;

      case 'llc':
        // LLCs often have a minimum tax and graduated rates based on revenue
        if (totalRevenue > 5000000) minimumTax = 11790;
        else if (totalRevenue > 1000000) minimumTax = 6000;
        else if (totalRevenue > 500000) minimumTax = 2500;
        else if (totalRevenue > 250000) minimumTax = 900;

        // Calculate tax based on brackets
        for (const bracket of taxBrackets) {
          if (taxableIncome > bracket.min_income) {
            const taxableAmount = bracket.max_income 
              ? Math.min(taxableIncome - bracket.min_income, bracket.max_income - bracket.min_income)
              : taxableIncome - bracket.min_income;
            calculatedTax += taxableAmount * bracket.rate;
          }
        }
        break;

      default:
        // Pass-through entities use progressive rates
        let remainingIncome = taxableIncome;
        for (const bracket of taxBrackets) {
          if (remainingIncome <= 0) break;
          
          const taxableAmount = bracket.max_income 
            ? Math.min(remainingIncome, bracket.max_income - bracket.min_income)
            : remainingIncome;
          
          calculatedTax += taxableAmount * bracket.rate;
          remainingIncome -= taxableAmount;
        }
    }
  }

  // Ensure tax is at least the minimum tax amount
  calculatedTax = Math.max(calculatedTax, minimumTax);

  // Add state-specific adjustments
  if (state === 'California' && taxableIncome > 1000000) {
    calculatedTax += (taxableIncome - 1000000) * 0.01; // Mental Health Services Tax
  }

  const effectiveRate = totalRevenue > 0 ? ((calculatedTax / totalRevenue) * 100) : 0;

  return {
    totalAmount: totalRevenue,
    deductions: totalDeductions,
    estimatedTax: calculatedTax,
    state,
    effectiveRate,
    taxableIncome,
    businessType,
    minimumTax
  };
};