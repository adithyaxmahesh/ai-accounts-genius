import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, context } = await req.json();
    console.log('Processing tax chat request for user:', userId);

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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY2');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Making request to OpenAI API...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a knowledgeable tax assistant. Provide accurate, helpful tax advice based on the user's context. 
            Available context: 
            - Write-offs: ${JSON.stringify(context?.writeOffs)}
            - Revenue Records: ${JSON.stringify(context?.revenueRecords)}
            - Tax Analysis: ${JSON.stringify(context?.taxAnalysis)}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiData = await openAIResponse.json();
    console.log('Successfully received OpenAI response');
    const answer = aiData.choices[0].message.content;

    // Save the conversation
    const { error: chatError } = await supabase
      .from('tax_planning_chats')
      .insert({
        user_id: userId,
        question: message,
        answer,
        context: {
          ...context,
          taxContext
        }
      });

    if (chatError) {
      console.error('Error saving chat:', chatError);
    }

    // Create a notification for the user
    await supabase
      .from('push_notifications')
      .insert({
        user_id: userId,
        title: 'New Tax Chat Response',
        body: 'Your tax assistant has provided a new response',
        type: 'tax_chat'
      });

    return new Response(
      JSON.stringify({ 
        answer,
        category: answer.includes('deduction') ? 'Deductions' : 
                 answer.includes('planning') ? 'Planning' :
                 'General'
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in tax-chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        headers: corsHeaders,
        status: 500
      }
    );
  }
});