export const calculateExpenseCategories = (writeOffs: any[]) => {
  return writeOffs.reduce((acc, writeOff) => {
    const baseCategory = writeOff.tax_codes?.expense_category || 'Miscellaneous';
    const category = Object.keys(COLORS).find(c => 
      baseCategory.toLowerCase().includes(c.toLowerCase())
    ) || 'Miscellaneous';
    
    const amount = Number(writeOff.amount);
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
};

export const COLORS = {
  'Operational': '#0088FE',
  'Employee & Payroll': '#00C49F',
  'Travel & Entertainment': '#FFBB28',
  'Marketing & Advertising': '#FF8042',
  'Professional Services': '#8884d8',
  'Insurance': '#82ca9d',
  'Taxes & Licenses': '#ffc658',
  'Equipment & Assets': '#ff7c43',
  'Technology & IT': '#665191',
  'Financial': '#a05195',
  'Research & Development': '#2f4b7c',
  'Training & Education': '#f95d6a',
  'Utilities': '#d45087',
  'Miscellaneous': '#a05195',
  'Sustainability': '#665191'
};