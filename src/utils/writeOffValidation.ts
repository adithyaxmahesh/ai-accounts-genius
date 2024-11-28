import { WriteOff } from "@/components/types";

export interface ValidationRule {
  rule: string;
  message: string;
}

export interface DocumentationRequirement {
  type: string;
  description: string;
  required: boolean;
}

export const validateWriteOff = (writeOff: WriteOff, taxCode: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Basic validation
  if (!writeOff.amount || writeOff.amount <= 0) {
    errors.push("Amount must be greater than 0");
  }
  
  if (!writeOff.description) {
    errors.push("Description is required");
  }
  
  // Tax code specific validation
  if (taxCode?.validation_rules) {
    const rules: ValidationRule[] = taxCode.validation_rules;
    
    rules.forEach(rule => {
      switch (rule.rule) {
        case 'square_footage_required':
          if (!writeOff.description.includes('sq ft')) {
            errors.push(rule.message);
          }
          break;
        case 'mileage_log_required':
          if (!writeOff.description.includes('miles')) {
            errors.push(rule.message);
          }
          break;
        case 'business_relevance':
          if (!writeOff.description.includes('business')) {
            errors.push(rule.message);
          }
          break;
      }
    });
  }

  // Check maximum deduction if applicable
  if (taxCode?.max_deduction_amount && writeOff.amount > taxCode.max_deduction_amount) {
    errors.push(`Amount exceeds maximum deduction of ${taxCode.max_deduction_amount}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getRequiredDocumentation = (taxCode: any): string[] => {
  return taxCode?.documentation_requirements || [];
};