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
    const { engagementId } = await req.json();
    console.log('Processing assurance analysis for engagement:', engagementId);
    
    if (!engagementId) {
      throw new Error('Engagement ID is required');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch engagement data
    const { data: engagement, error: engagementError } = await supabase
      .from('assurance_engagements')
      .select('*, client_name, engagement_type, risk_assessment, findings')
      .eq('id', engagementId)
      .single();

    if (engagementError) {
      console.error('Error fetching engagement:', engagementError);
      throw engagementError;
    }

    // Fetch procedures
    const { data: procedures, error: proceduresError } = await supabase
      .from('assurance_procedures')
      .select('*')
      .eq('engagement_id', engagementId);

    if (proceduresError) {
      console.error('Error fetching procedures:', proceduresError);
      throw proceduresError;
    }

    // Analyze with GPT-4
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
            content: 'You are an AI auditor analyzing assurance procedures and evidence. Provide detailed analysis including risk assessment, evidence validation, and recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this assurance engagement:\n${JSON.stringify({
              clientName: engagement.client_name,
              type: engagement.engagement_type,
              riskAssessment: engagement.risk_assessment,
              procedures: procedures
            }, null, 2)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    // Process the AI response
    const riskScore = Math.random(); // Simplified for example
    const confidenceScore = Math.random();
    const findings = [{
      description: "Sample finding from analysis",
      severity: "medium"
    }];
    const recommendations = [{
      description: "Sample recommendation from analysis",
      priority: "high"
    }];

    // Store analysis results
    const { data, error } = await supabase
      .from('ai_assurance_analysis')
      .insert({
        engagement_id: engagementId,
        analysis_type: 'comprehensive',
        risk_score: riskScore,
        confidence_score: confidenceScore,
        findings,
        recommendations
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing analysis:', error);
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-assurance function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});