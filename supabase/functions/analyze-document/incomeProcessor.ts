import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface Transaction {
  amount: number;
  description: string;
  line: number;
  type: string;
}

export async function processIncomeStatement(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  transactions: Transaction[]
) {
  // Categorize transactions
  const categorizedTransactions = transactions.map(transaction => {
    const description = transaction.description.toLowerCase();
    let category = 'other';

    // Revenue categories
    if (description.includes('sale') || description.includes('revenue')) {
      category = 'sales_revenue';
    } else if (description.includes('interest')) {
      category = 'interest_income';
    } else if (description.includes('investment')) {
      category = 'investment_income';
    }
    // Expense categories
    else if (description.includes('cost of goods') || description.includes('cogs')) {
      category = 'cost_of_goods_sold';
    } else if (description.includes('salary') || description.includes('wage')) {
      category = 'salary_expense';
    } else if (description.includes('rent')) {
      category = 'rent_expense';
    } else if (description.includes('utility')) {
      category = 'utility_expense';
    }

    return {
      user_id: userId,
      category,
      name: transaction.description,
      amount: Math.abs(transaction.amount),
      type: transaction.type,
      description: `Automatically generated from document analysis - Line ${transaction.line}`
    };
  });

  // Insert transactions into income_statements table
  const { error } = await supabaseClient
    .from('income_statements')
    .insert(categorizedTransactions);

  if (error) {
    console.error('Error inserting income statements:', error);
    throw error;
  }

  // Calculate and store totals
  const revenues = categorizedTransactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = categorizedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = revenues - expenses;

  // Store the summary in tax_analysis table
  await supabaseClient
    .from('tax_analysis')
    .insert({
      user_id: userId,
      analysis_type: 'income_statement',
      recommendations: {
        total_revenue: revenues,
        total_expenses: expenses,
        net_income: netIncome,
        statement_date: new Date().toISOString()
      }
    });
}