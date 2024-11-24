import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './utils.ts';

interface EquityTransaction {
  amount: number;
  description: string;
  type: string;
}

export async function processEquity(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  transactions: EquityTransaction[]
) {
  let netIncome = 0;
  let withdrawals = 0;
  let investments = 0;

  // Process transactions
  transactions.forEach(transaction => {
    const description = transaction.description.toLowerCase();
    
    if (description.includes('withdrawal') || description.includes('distribution')) {
      withdrawals += Math.abs(transaction.amount);
    } else if (description.includes('investment') || description.includes('contribution')) {
      investments += transaction.amount;
    } else if (transaction.type === 'revenue') {
      netIncome += transaction.amount;
    } else if (transaction.type === 'expense') {
      netIncome -= Math.abs(transaction.amount);
    }
  });

  // Insert equity statement
  const { error } = await supabaseClient
    .from('owners_equity_statements')
    .insert([
      {
        user_id: userId,
        category: 'net_income',
        name: 'Net Income',
        amount: netIncome,
        type: 'income',
        description: 'Automatically calculated from document analysis'
      },
      {
        user_id: userId,
        category: 'withdrawals',
        name: 'Owner Withdrawals',
        amount: withdrawals,
        type: 'withdrawal',
        description: 'Owner withdrawals detected from document analysis'
      },
      {
        user_id: userId,
        category: 'investments',
        name: 'Owner Investments',
        amount: investments,
        type: 'investment',
        description: 'Owner investments detected from document analysis'
      }
    ]);

  if (error) {
    console.error('Error processing equity:', error);
    throw error;
  }
}