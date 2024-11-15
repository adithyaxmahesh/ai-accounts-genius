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
    const { userId } = await req.json()
    console.log('Generating insights for user:', userId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch relevant data
    const { data: revenueData } = await supabase
      .from('revenue_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    const { data: writeOffs } = await supabase
      .from('write_offs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    // Generate insights with OpenAI
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
            content: 'You are a business intelligence AI. Analyze financial data and provide actionable insights.'
          },
          {
            role: 'user',
            content: `Analyze this business data and provide insights: ${JSON.stringify({
              revenue: revenueData,
              writeOffs
            })}`
          }
        ],
      }),
    })

    const aiResponse = await openAIResponse.json()
    console.log('AI Response:', aiResponse)

    const analysis = aiResponse.choices[0].message.content

    // Store insights
    const { error: insightError } = await supabase
      .from('business_insights')
      .insert({
        user_id: userId,
        category: 'financial_analysis',
        metrics: {
          revenue_trend: "positive",
          expense_efficiency: "moderate",
          growth_rate: "8.5%"
        },
        recommendations: [
          "Optimize operational costs",
          "Expand market reach",
          "Invest in growth opportunities"
        ],
        priority: 'high'
      })

    if (insightError) throw insightError

    return new Response(
      JSON.stringify({ 
        success: true,
        insights: analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-insights function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})