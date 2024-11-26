import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auditId } = await req.json();
    console.log('Processing audit risk analysis for audit:', auditId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get audit data
    const { data: audit, error: auditError } = await supabase
      .from('audit_reports')
      .select(`
        *,
        audit_items (*),
        audit_procedures (*),
        audit_risk_assessments (*)
      `)
      .eq('id', auditId)
      .single();

    if (auditError) throw auditError;

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY2');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Making request to OpenAI API for risk analysis...');
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
            content: 'You are an AI auditor specializing in risk assessment and control evaluation. Analyze the audit data and provide detailed risk insights and recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this audit data and provide risk assessment:\n${JSON.stringify(audit)}`
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
    console.log('Successfully received OpenAI analysis');
    const analysis = aiResponse.choices[0].message.content;

    // Process the AI response
    const riskScore = calculateRiskScore(analysis);
    const findings = extractFindings(analysis);
    const recommendations = extractRecommendations(analysis);
    const controlEvaluation = evaluateControls(analysis);

    // Update audit report with AI insights
    const { error: updateError } = await supabase
      .from('audit_reports')
      .update({
        risk_level: determineRiskLevel(riskScore),
        automated_analysis: {
          risk_score: riskScore,
          findings,
          recommendations,
          control_evaluation: controlEvaluation,
          analysis_date: new Date().toISOString()
        }
      })
      .eq('id', auditId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        riskScore,
        findings,
        recommendations,
        controlEvaluation
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-audit-risk function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper functions
function calculateRiskScore(analysis: string): number {
  const riskIndicators = analysis.toLowerCase().match(/risk|high|critical|severe|urgent/g)?.length || 0;
  return Math.min(Math.max(riskIndicators * 0.1, 0), 1);
}

function extractFindings(analysis: string): string[] {
  return analysis
    .split('\n')
    .filter(line => line.toLowerCase().includes('finding:'))
    .map(finding => finding.replace(/^finding:/i, '').trim());
}

function extractRecommendations(analysis: string): string[] {
  return analysis
    .split('\n')
    .filter(line => line.toLowerCase().includes('recommend:'))
    .map(rec => rec.replace(/^recommend:/i, '').trim());
}

function evaluateControls(analysis: string): Record<string, string> {
  const controls = {
    'Internal Controls': 'Not Evaluated',
    'Risk Management': 'Not Evaluated',
    'Governance': 'Not Evaluated'
  };

  if (analysis.toLowerCase().includes('internal control')) {
    controls['Internal Controls'] = analysis.includes('effective') ? 'Effective' : 'Needs Improvement';
  }
  if (analysis.toLowerCase().includes('risk management')) {
    controls['Risk Management'] = analysis.includes('adequate') ? 'Adequate' : 'Needs Review';
  }
  if (analysis.toLowerCase().includes('governance')) {
    controls['Governance'] = analysis.includes('strong') ? 'Strong' : 'Needs Enhancement';
  }

  return controls;
}

function determineRiskLevel(riskScore: number): string {
  if (riskScore >= 0.7) return 'high';
  if (riskScore >= 0.4) return 'medium';
  return 'low';
}