import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { engagementId, clientName, engagementType, status, findings, riskAreas } = await req.json();
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get additional context from the database
    const { data: procedures } = await supabase
      .from('assurance_procedures')
      .select('*')
      .eq('engagement_id', engagementId);

    const { data: evidence } = await supabase
      .from('assurance_evidence')
      .select('*')
      .eq('engagement_id', engagementId);

    // Analyze with GPT-4
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
            content: 'You are an AI auditor analyzing assurance engagements. Provide detailed analysis including risk assessment, findings validation, and actionable recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this assurance engagement:
            Client: ${clientName}
            Type: ${engagementType}
            Status: ${status}
            Risk Areas: ${JSON.stringify(riskAreas)}
            Findings: ${JSON.stringify(findings)}
            Procedures: ${JSON.stringify(procedures)}
            Evidence: ${JSON.stringify(evidence)}`
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    // Process the AI response
    const riskScore = calculateRiskScore(analysis);
    const confidenceScore = calculateConfidenceScore(analysis);
    const extractedFindings = extractFindings(analysis);
    const recommendations = extractRecommendations(analysis);
    const evidenceValidation = validateEvidence(analysis, evidence);

    // Store analysis results
    const { data, error } = await supabase
      .from('ai_assurance_analysis')
      .insert({
        engagement_id: engagementId,
        analysis_type: 'comprehensive',
        risk_score: riskScore,
        confidence_score: confidenceScore,
        findings: extractedFindings,
        recommendations: recommendations,
        evidence_validation: evidenceValidation,
      })
      .select()
      .single();

    if (error) throw error;

    // Update engagement status if needed
    if (riskScore > 0.7) {
      await supabase
        .from('assurance_engagements')
        .update({ 
          risk_assessment: { level: 'high', score: riskScore },
          recommendations: recommendations
        })
        .eq('id', engagementId);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-assurance function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function calculateRiskScore(analysis: string): number {
  const riskIndicators = analysis.toLowerCase().match(/risk|concern|issue|problem|critical|severe/g)?.length || 0;
  return Math.min(Math.max(riskIndicators * 0.15, 0), 1);
}

function calculateConfidenceScore(analysis: string): number {
  const confidenceIndicators = analysis.toLowerCase().match(/confident|certain|clear|evident|verified|validated/g)?.length || 0;
  return Math.min(Math.max(confidenceIndicators * 0.2, 0), 1);
}

function extractFindings(analysis: string): any[] {
  const findings = analysis.split('\n')
    .filter(line => line.toLowerCase().includes('finding:') || line.toLowerCase().includes('issue:'))
    .map(finding => ({
      description: finding.replace(/^(finding|issue):/i, '').trim(),
      severity: determineSeverity(finding),
    }));
  return findings;
}

function extractRecommendations(analysis: string): any[] {
  const recommendations = analysis.split('\n')
    .filter(line => line.toLowerCase().includes('recommend:') || line.toLowerCase().includes('suggestion:'))
    .map(rec => ({
      description: rec.replace(/^(recommend|suggestion):/i, '').trim(),
      priority: determinePriority(rec),
    }));
  return recommendations;
}

function validateEvidence(analysis: string, evidence: any[]): any {
  return {
    isValid: !analysis.toLowerCase().includes('insufficient evidence'),
    completeness: evidence.length > 0 ? 1 : 0,
    reliability: calculateReliability(analysis),
    validationNotes: extractValidationNotes(analysis),
  };
}

function determineSeverity(finding: string): string {
  const text = finding.toLowerCase();
  if (text.includes('critical') || text.includes('severe') || text.includes('high')) return 'high';
  if (text.includes('moderate') || text.includes('medium')) return 'medium';
  return 'low';
}

function determinePriority(recommendation: string): string {
  const text = recommendation.toLowerCase();
  if (text.includes('immediate') || text.includes('urgent') || text.includes('critical')) return 'high';
  if (text.includes('soon') || text.includes('consider')) return 'medium';
  return 'low';
}

function calculateReliability(analysis: string): number {
  const reliabilityIndicators = analysis.toLowerCase().match(/reliable|accurate|verified|valid|complete/g)?.length || 0;
  return Math.min(Math.max(reliabilityIndicators * 0.2, 0), 1);
}

function extractValidationNotes(analysis: string): string[] {
  return analysis.split('\n')
    .filter(line => line.toLowerCase().includes('validation:'))
    .map(note => note.replace(/^validation:/i, '').trim());
}