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

export const calculateTaxes = (taxAnalysis: TaxAnalysisResponse | undefined | null, audit: any) => {
  if (taxAnalysis?.recommendations) {
    const totalRevenue = taxAnalysis.recommendations.total_revenue || 0;
    const totalDeductions = taxAnalysis.recommendations.total_deductions || 0;
    const taxableIncome = taxAnalysis.recommendations.taxable_income || 0;
    const businessType = taxAnalysis.recommendations.business_type || 'corporation';
    
    let stateTaxRate = 0.0884; // Default C-Corp rate
    let minimumTax = 800;
    
    switch (businessType) {
      case 'sole_proprietorship':
        if (taxableIncome <= 10099) stateTaxRate = 0.01;
        else if (taxableIncome <= 23942) stateTaxRate = 0.02;
        else if (taxableIncome <= 37788) stateTaxRate = 0.04;
        else if (taxableIncome <= 52455) stateTaxRate = 0.06;
        else if (taxableIncome <= 66295) stateTaxRate = 0.08;
        else if (taxableIncome <= 338639) stateTaxRate = 0.093;
        else if (taxableIncome <= 406364) stateTaxRate = 0.103;
        else if (taxableIncome <= 677275) stateTaxRate = 0.113;
        else stateTaxRate = 0.123;
        minimumTax = 0;
        break;
      case 'llc':
        stateTaxRate = 0.015;
        if (totalRevenue > 5000000) minimumTax = 11790;
        else if (totalRevenue > 1000000) minimumTax = 6000;
        else if (totalRevenue > 500000) minimumTax = 2500;
        else if (totalRevenue > 250000) minimumTax = 900;
        break;
      case 'corporation':
        stateTaxRate = 0.0884;
        break;
    }

    const calculatedTax = Math.max(taxableIncome * stateTaxRate, minimumTax);
    const effectiveRate = totalRevenue > 0 ? ((calculatedTax / totalRevenue) * 100) : 0;

    return {
      totalAmount: totalRevenue,
      deductions: totalDeductions,
      estimatedTax: calculatedTax,
      state: taxAnalysis.jurisdiction || 'California',
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