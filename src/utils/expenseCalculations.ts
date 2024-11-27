import { WriteOff } from "@/components/types";

export const COLORS = {
  Transportation: "#FF6B6B",
  Office: "#4ECDC4",
  Marketing: "#45B7D1",
  Travel: "#96CEB4",
  Equipment: "#FFEEAD",
  Services: "#D4A5A5",
  Other: "#9BA4B4"
} as const;

export const calculateExpenseCategories = (writeOffs: WriteOff[]) => {
  console.log('Calculating categories for write-offs:', writeOffs); // Debug log
  
  return writeOffs.reduce((acc, writeOff) => {
    const category = writeOff.tax_codes?.expense_category || 'Other';
    console.log('Processing write-off:', writeOff.description, 'Category:', category); // Debug log
    
    acc[category] = (acc[category] || 0) + Number(writeOff.amount);
    return acc;
  }, {} as Record<string, number>);
};