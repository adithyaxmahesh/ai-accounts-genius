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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current cash position
    const { data: balanceSheet } = await supabase
      .from('balance_sheet_items')
      .select('*')
      .eq('user_id', userId)
      .eq('category', 'current-assets')

    const availableCash = balanceSheet?.reduce((sum, item) => sum + Number(item.amount), 0) || 0

    // Get historical spending patterns
    const { data: expenses } = await supabase
      .from('write_offs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    // Calculate spending patterns
    const expensesByCategory = expenses?.reduce((acc, expense) => {
      const category = expense.category || 'Other'
      acc[category] = (acc[category] || 0) + Number(expense.amount)
      return acc
    }, {})

    // Generate AI recommendations
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor. Generate budget recommendations based on available cash and spending patterns.'
          },
          {
            role: 'user',
            content: `Available cash: $${availableCash}. Historical spending patterns: ${JSON.stringify(expensesByCategory)}`
          }
        ],
      }),
    })

    const aiResponse = await openAIResponse.json()
    const recommendations = aiResponse.choices[0].message.content

    // Store recommendations
    const { data: storedRecs, error } = await supabase
      .from('ai_budget_recommendations')
      .insert({
        user_id: userId,
        category: 'monthly-budget',
        current_spending: expensesByCategory,
        recommended_spending: recommendations,
        confidence_score: 0.85
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ recommendations: storedRecs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in analyze-budget function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})