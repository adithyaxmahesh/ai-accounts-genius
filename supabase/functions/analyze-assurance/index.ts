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

    const analysisPrompt = `
      As an expert CPA and financial auditor, analyze this assurance engagement with professional accounting insights:
      
      Client: ${engagement.client_name}
      Type: ${engagement.engagement_type}
      Risk Assessment: ${JSON.stringify(engagement.risk_assessment)}
      
      Procedures Performed: ${JSON.stringify(engagement.assurance_procedures)}
      Evidence Collected: ${JSON.stringify(engagement.assurance_evidence)}
      
      Provide a detailed professional analysis including:
      1. Material financial statement risks and control deficiencies
      2. Compliance with GAAP/IFRS standards
      3. Internal control effectiveness evaluation
      4. Specific accounting treatment recommendations
      5. Revenue recognition and expense validation findings
      6. Asset valuation and impairment considerations
      7. Going concern assessment if applicable
      8. Tax compliance implications
      
      Format your response to include specific findings with materiality thresholds and actionable recommendations based on professional accounting standards.
      
      For each finding, include:
      - Description of the issue
      - Impact on financial statements
      - Severity (high/medium/low)
      - Specific accounting standards referenced
      - Quantitative materiality assessment
      
      For each recommendation:
      - Specific corrective actions
      - Timeline for implementation
      - Required resources
      - Expected impact on controls/compliance
      - Priority level
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert CPA and auditor providing professional assurance analysis.'
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
    
    // Enhanced processing of AI response
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
  const findingsMatch = analysisText.match(/(?:Material Findings|Key Issues|Financial Risks|Findings):(.*?)(?=Recommendations|$)/s);
  const recommendationsMatch = analysisText.match(/Recommendations:(.*?)(?=\n\n|$)/s);
  
  // Calculate risk score based on professional indicators
  const riskIndicators = [
    'material weakness', 'significant deficiency', 'control deficiency',
    'non-compliance', 'misstatement', 'going concern', 'fraud risk',
    'regulatory violation', 'impairment', 'material error'
  ];
  
  let riskScore = 0.5; // Default medium risk
  let confidenceScore = 0.85; // Default high confidence for professional analysis
  
  // Adjust risk score based on professional findings
  const lowerContent = analysisText.toLowerCase();
  riskIndicators.forEach(indicator => {
    if (lowerContent.includes(indicator.toLowerCase())) {
      riskScore += 0.1;
    }
  });
  
  // Cap risk score between 0 and 1
  riskScore = Math.min(Math.max(riskScore, 0), 1);
  
  // Process findings with professional context
  const findings = findingsMatch ? findingsMatch[1]
    .split(/\n(?=\d+\.|\*|\-|\•)/)
    .filter(f => f.trim())
    .map(finding => {
      const severityMatch = finding.match(/severity:\s*(high|medium|low)/i);
      const categoryMatch = finding.match(/category:\s*([\w\s]+)/i);
      const impactMatch = finding.match(/impact:\s*([\w\s]+)/i);
      
      return {
        description: finding.replace(/^[-•*\d\.]\s*/, '').trim(),
        severity: severityMatch ? severityMatch[1].toLowerCase() : 
                 finding.toLowerCase().includes('material') ? 'high' :
                 finding.toLowerCase().includes('significant') ? 'medium' : 'low',
        category: categoryMatch ? categoryMatch[1].trim() :
                 finding.toLowerCase().includes('control') ? 'Internal Controls' :
                 finding.toLowerCase().includes('compliance') ? 'Compliance' :
                 finding.toLowerCase().includes('financial') ? 'Financial Reporting' :
                 'General',
        impact: impactMatch ? impactMatch[1].trim() : 'Undefined'
      };
    }) : [];
    
  // Process recommendations with professional context
  const recommendations = recommendationsMatch ? recommendationsMatch[1]
    .split(/\n(?=\d+\.|\*|\-|\•)/)
    .filter(r => r.trim())
    .map(recommendation => {
      const priorityMatch = recommendation.match(/priority:\s*(high|medium|low)/i);
      const timelineMatch = recommendation.match(/timeline:\s*([\w\s]+)/i);
      const impactMatch = recommendation.match(/impact:\s*([\w\s]+)/i);
      
      return {
        description: recommendation.replace(/^[-•*\d\.]\s*/, '').trim(),
        priority: priorityMatch ? priorityMatch[1].toLowerCase() :
                 recommendation.toLowerCase().includes('immediately') ? 'high' :
                 recommendation.toLowerCase().includes('should') ? 'medium' : 'low',
        timeline: timelineMatch ? timelineMatch[1].trim() : 'As soon as possible',
        impact: impactMatch ? impactMatch[1].trim() : 
               recommendation.toLowerCase().includes('material') ? 'Material' :
               recommendation.toLowerCase().includes('significant') ? 'Significant' : 'Moderate',
        area: recommendation.toLowerCase().includes('control') ? 'Internal Controls' :
              recommendation.toLowerCase().includes('compliance') ? 'Compliance' :
              recommendation.toLowerCase().includes('financial') ? 'Financial Reporting' :
              'General'
      };
    }) : [];

  return {
    riskScore,
    confidenceScore,
    findings,
    recommendations
  };
}