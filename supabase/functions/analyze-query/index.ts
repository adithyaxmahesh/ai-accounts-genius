import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, userId, context } = await req.json()
    console.log('Processing query:', query)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get tax codes and rules for better context
    const { data: taxCodes } = await supabase
      .from('tax_codes')
      .select('*')

    const { data: taxRules } = await supabase
      .from('tax_rules')
      .select('*')

    // Process with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an AI tax assistant with expertise in financial analysis and tax optimization.
            Analyze the user's query and financial data to provide specific, actionable advice.
            When discussing write-offs or deductions, reference specific tax codes.
            If discussing expenses, use actual numbers from the provided data.
            Categorize your responses into: TAX_PLANNING, DEDUCTIONS, COMPLIANCE, or ANALYSIS.
            If the query requires updating tax calculations, set requiresUpdate to true.`
          },
          {
            role: 'user',
            content: `Context:
            Financial Data: ${JSON.stringify(context)}
            Tax Codes: ${JSON.stringify(taxCodes)}
            Tax Rules: ${JSON.stringify(taxRules)}
            
            Question: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const aiResponse = await response.json()
    const answer = aiResponse.choices[0].message.content

    // Determine if we need to update tax calculations
    const requiresUpdate = answer.toLowerCase().includes('recalculate') || 
                         answer.toLowerCase().includes('update needed')

    // Determine the category of the response
    const category = answer.includes('TAX_PLANNING') ? 'Tax Planning' :
                    answer.includes('DEDUCTIONS') ? 'Deductions' :
                    answer.includes('COMPLIANCE') ? 'Compliance' :
                    'Analysis'

    // If update is required, trigger tax calculation
    if (requiresUpdate) {
      await supabase.functions.invoke('calculate-taxes', {
        body: { userId }
      })
    }

    // Store the interaction for future context
    await supabase
      .from('tax_planning_chats')
      .insert({
        user_id: userId,
        question: query,
        answer,
        context: {
          requiresUpdate,
          category,
          timestamp: new Date().toISOString()
        }
      })

    console.log('Generated response:', answer)

    return new Response(
      JSON.stringify({ 
        answer: answer.replace(/TAX_PLANNING:|DEDUCTIONS:|COMPLIANCE:|ANALYSIS:/g, ''),
        category,
        requiresUpdate
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})