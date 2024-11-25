import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY2');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    console.log('Generating insights for user:', userId);

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch financial data
    const { data: financialData, error: financialError } = await supabase
      .from('financial_health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (financialError) throw financialError;

    // Generate insights using GPT-4
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
            content: 'You are a financial analyst AI that provides insights and recommendations based on financial metrics.'
          },
          {
            role: 'user',
            content: `Analyze these financial metrics and provide insights: ${JSON.stringify(financialData)}`
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    // Process AI response into structured insights
    const insights = [
      {
        category: 'trend',
        insight: `Financial Health Score: ${financialData.health_score}. ${analysis.split('.')[0]}.`,
        confidence_score: 0.85
      },
      {
        category: 'optimization',
        insight: analysis.split('.')[1] || 'Consider reviewing your financial metrics for optimization opportunities.',
        confidence_score: 0.75
      }
    ];

    // Save insights to database
    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert(insights.map(insight => ({
        user_id: userId,
        ...insight,
        created_at: new Date().toISOString()
      })));

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});