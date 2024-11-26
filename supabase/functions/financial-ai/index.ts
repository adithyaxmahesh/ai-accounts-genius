import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, type } = await req.json();
    console.log('Processing financial AI request:', { type, userId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY2');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get relevant financial context
    const { data: financialContext } = await supabase
      .from('financial_health_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Process with OpenAI
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
            content: `You are an AI financial advisor. Analyze queries and provide specific advice based on the user's financial context.
            For budget recommendations, suggest specific savings targets.
            For tax planning, reference relevant tax codes and deductions.
            For risk management, evaluate potential risks and mitigation strategies.`
          },
          {
            role: 'user',
            content: `Context: ${JSON.stringify(financialContext)}
            Query Type: ${type}
            Question: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const aiResponse = await response.json();
    const answer = aiResponse.choices[0].message.content;

    // Store the interaction
    await supabase
      .from('ai_chat_history')
      .insert({
        user_id: userId,
        query,
        response: answer,
        category: type,
        context: financialContext
      });

    // Generate and store recommendations if applicable
    if (type === 'budget') {
      await supabase
        .from('ai_budget_recommendations')
        .insert({
          user_id: userId,
          category: 'expense_optimization',
          current_spending: financialContext?.current_spending || 0,
          recommended_spending: financialContext?.recommended_spending || 0,
          reasoning: answer,
          confidence_score: 0.85
        });
    }

    return new Response(
      JSON.stringify({ answer, category: type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in financial-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});