import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get relevant tax context
    const { data: taxContext, error: contextError } = await supabase
      .from('tax_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (contextError) {
      console.error('Error fetching tax context:', contextError);
    }

    // Process with OpenAI using a faster model
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
            content: 'You are a knowledgeable tax assistant. Provide accurate, helpful tax advice based on the user\'s context.'
          },
          {
            role: 'user',
            content: `Context: ${JSON.stringify(taxContext)}\n\nQuestion: ${message}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiData = await openAIResponse.json();
    const answer = aiData.choices[0].message.content;

    // Save the conversation
    const { error: chatError } = await supabase
      .from('tax_planning_chats')
      .insert({
        user_id: userId,
        question: message,
        answer,
        context: taxContext
      });

    if (chatError) throw chatError;

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in tax-chat function:', error);
    let errorMessage = 'Failed to process your question.';
    
    if (error.message?.includes('Rate limit')) {
      errorMessage = 'You have reached the rate limit for chat requests. Please try again later.';
    } else if (error.message?.includes('insufficient_quota')) {
      errorMessage = 'The monthly API quota has been reached. Please try again next month.';
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});