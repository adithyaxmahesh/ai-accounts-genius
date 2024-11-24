import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type TaxAnalysisResponse = Database['public']['Tables']['tax_analysis']['Row'] & {
  recommendations?: {
    total_revenue?: number;
    total_expenses?: number;
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
    // Get expenses total from write-offs
    const { data: writeOffs, error: writeOffsError } = await supabase
      .from('write_offs')
      .select('amount')
      .eq('status', 'approved');

    if (writeOffsError) throw writeOffsError;

    const totalExpenses = writeOffs?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    // Get revenue total from documents
    const { data: revenueRecords, error: revenueError } = await supabase
      .from('revenue_records')
      .select('amount');

    if (revenueError) throw revenueError;

    const totalRevenue = revenueRecords?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    // Calculate taxable income
    const taxableIncome = Math.max(0, totalRevenue - totalExpenses);

    // 2024 Federal Tax Rates for Corporations
    const federalTaxRate = 0.21; // 21% flat rate for corporations
    const federalTax = taxableIncome * federalTaxRate;

    // Get state tax brackets for 2024
    const { data: taxBrackets } = await supabase
      .from('state_tax_brackets')
      .select('*')
      .eq('state', state)
      .eq('business_type', businessType)
      .order('min_income', { ascending: true });

    let stateTax = 0;
    let minimumTax = 800; // Default minimum tax

    if (taxBrackets && taxBrackets.length > 0) {
      switch (businessType) {
        case 'corporation':
          // California corporate tax rate for 2024 is 8.84%
          stateTax = taxableIncome * 0.0884;
          break;

        case 'llc':
          // 2024 LLC fees based on total revenue
          if (totalRevenue > 5000000) minimumTax = 11790;
          else if (totalRevenue > 1000000) minimumTax = 6000;
          else if (totalRevenue > 500000) minimumTax = 2500;
          else if (totalRevenue > 250000) minimumTax = 900;

          // Calculate progressive state tax
          for (const bracket of taxBrackets) {
            if (taxableIncome > bracket.min_income) {
              const taxableAmount = bracket.max_income 
                ? Math.min(taxableIncome - bracket.min_income, bracket.max_income - bracket.min_income)
                : taxableIncome - bracket.min_income;
              stateTax += taxableAmount * bracket.rate;
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
            
            stateTax += taxableAmount * bracket.rate;
            remainingIncome -= taxableAmount;
          }
      }
    }

    // Ensure state tax is at least the minimum tax amount
    stateTax = Math.max(stateTax, minimumTax);

    // Add Mental Health Services Tax for California (1% on income over $1M)
    if (state === 'California' && taxableIncome > 1000000) {
      stateTax += (taxableIncome - 1000000) * 0.01;
    }

    const totalTax = federalTax + stateTax;
    const effectiveRate = totalRevenue > 0 ? ((totalTax / totalRevenue) * 100) : 0;

    return {
      totalAmount: totalRevenue,
      expenses: totalExpenses,
      estimatedTax: totalTax,
      federalTax,
      stateTax,
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
      expenses: 0,
      estimatedTax: 0,
      federalTax: 0,
      stateTax: 0,
      state,
      effectiveRate: 0,
      taxableIncome: 0,
      businessType,
      minimumTax: 800
    };
  }
};