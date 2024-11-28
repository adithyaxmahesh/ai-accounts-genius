import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    if (!userId) {
      throw new Error('User ID is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current cash position
    const { data: balanceSheet, error: balanceError } = await supabase
      .from('balance_sheet_items')
      .select('*')
      .eq('user_id', userId)
      .eq('category', 'current-assets')

    if (balanceError) throw balanceError

    const availableCash = balanceSheet?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

    // Get historical spending patterns
    const { data: expenses, error: expensesError } = await supabase
      .from('write_offs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (expensesError) throw expensesError

    // Calculate spending patterns
    const expensesByCategory = expenses?.reduce((acc, expense) => {
      const category = expense.category || 'Other'
      acc[category] = (acc[category] || 0) + Number(expense.amount)
      return acc
    }, {}) || {}

    // Store recommendations
    const { data: storedRecs, error: storeError } = await supabase
      .from('ai_budget_recommendations')
      .insert({
        user_id: userId,
        category: 'monthly-budget',
        current_spending: expensesByCategory,
        recommended_spending: `Based on your available cash of $${availableCash.toLocaleString()} and historical spending patterns, here are your budget recommendations:\n\n` +
          Object.entries(expensesByCategory)
            .map(([category, amount]) => `${category}: Consider allocating $${Number(amount).toLocaleString()}`)
            .join('\n'),
        confidence_score: 0.85
      })
      .select()
      .single()

    if (storeError) throw storeError

    return new Response(
      JSON.stringify({ success: true, data: storedRecs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in analyze-budget function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})