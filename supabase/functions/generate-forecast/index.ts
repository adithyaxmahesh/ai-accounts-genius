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
    console.log('Generating forecast for user:', userId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get historical data
    const { data: revenueData } = await supabase
      .from('revenue_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(90)

    const { data: balanceSheet } = await supabase
      .from('balance_sheet_items')
      .select('*')
      .eq('user_id', userId)

    // Generate forecast with OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY2')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst AI. Generate revenue forecasts based on historical data.'
          },
          {
            role: 'user',
            content: `Analyze this financial data and provide a 30-day forecast: ${JSON.stringify({
              revenue: revenueData,
              balanceSheet
            })}`
          }
        ],
      }),
    })

    const aiResponse = await openAIResponse.json()
    console.log('AI Response:', aiResponse)

    const analysis = aiResponse.choices[0].message.content
    const predictedRevenue = 50000 + Math.random() * 10000 // Example calculation
    const confidenceLevel = 85 + Math.random() * 10 // Example confidence level

    // Store forecast
    const { error: forecastError } = await supabase
      .from('forecasts')
      .insert({
        user_id: userId,
        predicted_revenue: predictedRevenue,
        confidence_level: confidenceLevel,
        factors: {
          trend: "Positive growth trend observed",
          seasonality: "Accounting for historical patterns",
          market: "Favorable market conditions"
        },
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (forecastError) throw forecastError

    return new Response(
      JSON.stringify({ 
        success: true,
        forecast: {
          predictedRevenue,
          confidenceLevel,
          analysis
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-forecast function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})