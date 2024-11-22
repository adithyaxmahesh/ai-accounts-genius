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

    // Get tax codes for better context
    const { data: taxCodes } = await supabase
      .from('tax_codes')
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
            You have access to the user's financial data and tax codes.
            Provide specific, actionable advice based on the available data.
            When discussing write-offs or deductions, reference specific tax codes when applicable.
            If discussing expenses, use actual numbers from the provided data.
            Always aim to provide practical, compliant tax optimization strategies.`
          },
          {
            role: 'user',
            content: `Context:
            Financial Data: ${JSON.stringify(context)}
            Tax Codes: ${JSON.stringify(taxCodes)}
            
            Question: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const analysis = await response.json()
    console.log('Generated response:', analysis.choices[0].message.content)

    return new Response(
      JSON.stringify({ answer: analysis.choices[0].message.content }),
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