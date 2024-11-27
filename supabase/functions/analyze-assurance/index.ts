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
    console.log('Starting analyze-assurance function');
    const { engagementId } = await req.json();
    
    if (!engagementId) {
      throw new Error('Engagement ID is required');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch engagement data with detailed information
    const { data: engagement, error: engagementError } = await supabase
      .from('assurance_engagements')
      .select(`
        *,
        assurance_procedures(*),
        assurance_evidence(*)
      `)
      .eq('id', engagementId)
      .single();

    if (engagementError) throw engagementError;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced prompt for better analysis
    const analysisPrompt = `
      As an expert auditor and risk analyst, analyze this assurance engagement:
      
      Client: ${engagement.client_name}
      Type: ${engagement.engagement_type}
      Risk Assessment: ${JSON.stringify(engagement.risk_assessment)}
      
      Procedures Performed: ${JSON.stringify(engagement.assurance_procedures)}
      Evidence Collected: ${JSON.stringify(engagement.assurance_evidence)}
      
      Please provide:
      1. A detailed risk assessment with specific areas of concern
      2. Analysis of control effectiveness
      3. Concrete recommendations for improvement
      4. Compliance considerations
      5. Quality of evidence assessment
      
      Format the response to include specific findings and actionable recommendations.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert AI auditor analyzing assurance engagements. Provide detailed, actionable insights.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;
    
    // Process the AI response into structured data
    const processedAnalysis = processAIResponse(analysis);
    
    // Store analysis results
    const { data, error } = await supabase
      .from('ai_assurance_analysis')
      .insert({
        engagement_id: engagementId,
        analysis_type: 'comprehensive',
        risk_score: processedAnalysis.riskScore,
        confidence_score: processedAnalysis.confidenceScore,
        findings: processedAnalysis.findings,
        recommendations: processedAnalysis.recommendations,
        user_id: engagement.user_id
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-assurance function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function processAIResponse(analysisText: string) {
  // Extract key sections from the AI response
  const findingsMatch = analysisText.match(/(?:Key Findings|Areas of Concern):(.*?)(?=Recommendations|$)/s);
  const recommendationsMatch = analysisText.match(/Recommendations:(.*?)(?=\n\n|$)/s);
  
  // Calculate risk score based on the content
  const riskIndicators = [
    'high risk', 'significant concern', 'critical', 'major issue',
    'severe', 'urgent', 'immediate attention'
  ];
  
  let riskScore = 0.5; // Default medium risk
  let confidenceScore = 0.8; // Default high confidence
  
  // Adjust risk score based on content
  const lowerContent = analysisText.toLowerCase();
  riskIndicators.forEach(indicator => {
    if (lowerContent.includes(indicator.toLowerCase())) {
      riskScore += 0.1;
    }
  });
  
  // Cap risk score between 0 and 1
  riskScore = Math.min(Math.max(riskScore, 0), 1);
  
  // Process findings
  const findings = findingsMatch ? findingsMatch[1]
    .split(/\n/)
    .filter(f => f.trim())
    .map(finding => ({
      description: finding.replace(/^[-•*]\s*/, '').trim(),
      severity: finding.toLowerCase().includes('high') ? 'high' :
               finding.toLowerCase().includes('medium') ? 'medium' : 'low'
    })) : [];
    
  // Process recommendations
  const recommendations = recommendationsMatch ? recommendationsMatch[1]
    .split(/\n/)
    .filter(r => r.trim())
    .map(recommendation => ({
      description: recommendation.replace(/^[-•*]\s*/, '').trim(),
      priority: recommendation.toLowerCase().includes('urgent') ? 'high' :
                recommendation.toLowerCase().includes('should') ? 'medium' : 'low'
    })) : [];

  return {
    riskScore,
    confidenceScore,
    findings,
    recommendations
  };
}