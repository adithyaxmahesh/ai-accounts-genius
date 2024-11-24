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
  try {
    // Get write-offs total
    const { data: writeOffs, error: writeOffsError } = await supabase
      .from('write_offs')
      .select('amount')
      .eq('status', 'approved');

    if (writeOffsError) throw writeOffsError;

    const totalDeductions = writeOffs?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    // Get revenue total from documents
    const { data: revenueRecords, error: revenueError } = await supabase
      .from('revenue_records')
      .select('amount');

    if (revenueError) throw revenueError;

    const totalRevenue = revenueRecords?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    // Calculate taxable income
    const taxableIncome = Math.max(0, totalRevenue - totalDeductions);

    // Get tax brackets for the state and business type
    const { data: taxBrackets } = await supabase
      .from('state_tax_brackets')
      .select('*')
      .eq('state', state)
      .eq('business_type', businessType)
      .order('min_income', { ascending: true });

    let calculatedTax = 0;
    let minimumTax = 800; // Default minimum tax for corporations

    if (taxBrackets && taxBrackets.length > 0) {
      // Special handling for different business types
      switch (businessType) {
        case 'corporation':
          calculatedTax = taxableIncome * taxBrackets[0].rate;
          break;

        case 'llc':
          if (totalRevenue > 5000000) minimumTax = 11790;
          else if (totalRevenue > 1000000) minimumTax = 6000;
          else if (totalRevenue > 500000) minimumTax = 2500;
          else if (totalRevenue > 250000) minimumTax = 900;

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
  } catch (error) {
    console.error('Error calculating taxes:', error);
    return {
      totalAmount: 0,
      deductions: 0,
      estimatedTax: 0,
      state,
      effectiveRate: 0,
      taxableIncome: 0,
      businessType,
      minimumTax: 800
    };
  }
};