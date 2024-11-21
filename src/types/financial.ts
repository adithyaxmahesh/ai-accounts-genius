export interface FinancialRecord {
  date: Date
  description: string
  amount: number
  type: 'income' | 'expense'
}

export interface TaxResult {
  totalIncome: number
  totalExpenses: number
  taxableIncome: number
  taxesOwed: number
}