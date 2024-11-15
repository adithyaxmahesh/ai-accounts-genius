import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, transactions } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Analyze transactions for fraud patterns
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a fraud detection AI. Analyze transactions for suspicious patterns.'
          },
          {
            role: 'user',
            content: `Analyze these transactions for potential fraud: ${JSON.stringify(transactions)}`
          }
        ],
      }),
    })

    const aiResponse = await response.json()
    const analysis = aiResponse.choices[0].message.content
    const riskScore = 0.7 // This would be calculated based on the analysis

    // Store fraud alert if risk is high
    if (riskScore > 0.5) {
      const { error } = await supabaseClient
        .from('fraud_alerts')
        .insert({
          user_id: userId,
          alert_type: 'suspicious_transaction',
          risk_score: riskScore,
          details: { analysis, transactions },
          status: 'pending'
        })

      if (error) throw error
    }

    return new Response(
      JSON.stringify({ success: true, riskScore, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})