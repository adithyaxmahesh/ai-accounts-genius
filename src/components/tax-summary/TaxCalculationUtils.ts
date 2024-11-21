import { Database } from "@/integrations/supabase/types";

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

const CA_TAX_BRACKETS = [
  { min: 0, max: 10099, rate: 0.01 },
  { min: 10100, max: 23942, rate: 0.02 },
  { min: 23943, max: 37788, rate: 0.04 },
  { min: 37789, max: 52455, rate: 0.06 },
  { min: 52456, max: 66295, rate: 0.08 },
  { min: 66296, max: 338639, rate: 0.093 },
  { min: 338640, max: 406364, rate: 0.103 },
  { min: 406365, max: 677275, rate: 0.113 },
  { min: 677276, max: Infinity, rate: 0.123 }
];

const NY_TAX_BRACKETS = [
  { min: 0, max: 8500, rate: 0.04 },
  { min: 8501, max: 11700, rate: 0.045 },
  { min: 11701, max: 13900, rate: 0.0525 },
  { min: 13901, max: 21400, rate: 0.059 },
  { min: 21401, max: 80650, rate: 0.0597 },
  { min: 80651, max: 215400, rate: 0.0633 },
  { min: 215401, max: 1077550, rate: 0.0685 },
  { min: 1077551, max: Infinity, rate: 0.0882 }
];

const TX_TAX_BRACKETS = [
  { min: 0, max: Infinity, rate: 0 } // No state income tax
];

const FL_TAX_BRACKETS = [
  { min: 0, max: Infinity, rate: 0 } // No state income tax
];

const getStateTaxBrackets = (state: string) => {
  switch (state) {
    case 'California':
      return CA_TAX_BRACKETS;
    case 'New York':
      return NY_TAX_BRACKETS;
    case 'Texas':
      return TX_TAX_BRACKETS;
    case 'Florida':
      return FL_TAX_BRACKETS;
    default:
      return CA_TAX_BRACKETS;
  }
};

const calculateProgressiveTax = (income: number, brackets: typeof CA_TAX_BRACKETS) => {
  let remainingIncome = income;
  let totalTax = 0;

  for (const bracket of brackets) {
    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max === Infinity ? remainingIncome : bracket.max - bracket.min + 1
    );
    
    if (taxableInBracket <= 0) break;
    
    totalTax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return totalTax;
};

export const calculateTaxes = (
  taxAnalysis: TaxAnalysisResponse | undefined | null, 
  audit: any,
  businessType: string,
  state: string
) => {
  if (taxAnalysis?.recommendations) {
    const totalRevenue = taxAnalysis.recommendations.total_revenue || 0;
    const totalDeductions = taxAnalysis.recommendations.total_deductions || 0;
    const taxableIncome = taxAnalysis.recommendations.taxable_income || 0;
    
    let minimumTax = 800;
    let calculatedTax = 0;
    
    switch (businessType) {
      case 'sole_proprietorship':
        minimumTax = 0;
        calculatedTax = calculateProgressiveTax(taxableIncome, getStateTaxBrackets(state));
        break;
      case 'llc':
        if (totalRevenue > 5000000) minimumTax = 11790;
        else if (totalRevenue > 1000000) minimumTax = 6000;
        else if (totalRevenue > 500000) minimumTax = 2500;
        else if (totalRevenue > 250000) minimumTax = 900;
        calculatedTax = Math.max(taxableIncome * 0.015, minimumTax);
        break;
      case 'corporation':
        calculatedTax = Math.max(taxableIncome * 0.0884, minimumTax);
        break;
      case 'partnership':
        minimumTax = 0;
        calculatedTax = calculateProgressiveTax(taxableIncome, getStateTaxBrackets(state));
        break;
      default:
        calculatedTax = Math.max(taxableIncome * 0.0884, minimumTax);
    }

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
  }

  if (!audit?.audit_items) {
    return {
      totalAmount: 0,
      estimatedTax: 0,
      deductions: 0,
      state: 'California',
      effectiveRate: 0,
      taxableIncome: 0,
      businessType: 'corporation',
      minimumTax: 800
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
    taxableIncome,
    businessType: 'corporation',
    minimumTax: 800
  };
};