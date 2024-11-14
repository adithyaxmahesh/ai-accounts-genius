import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { data, type } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

    // Prepare the prompt based on analysis type
    let prompt = ''
    switch (type) {
      case 'audit':
        prompt = `Analyze this financial audit data and provide insights: ${JSON.stringify(data)}`
        break
      case 'forecast':
        prompt = `Based on this historical financial data, provide revenue forecasts and trends: ${JSON.stringify(data)}`
        break
      case 'writeoffs':
        prompt = `Analyze these write-offs and suggest tax optimization strategies: ${JSON.stringify(data)}`
        break
      default:
        prompt = `Analyze this financial data and provide insights: ${JSON.stringify(data)}`
    }

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
            content: 'You are a financial analyst AI assistant. Provide clear, actionable insights.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    })

    const result = await response.json()
    console.log('AI Analysis completed successfully')

    return new Response(JSON.stringify({ 
      analysis: result.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in analyze-financials function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})