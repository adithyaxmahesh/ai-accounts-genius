import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getEngagementAnalysisPrompt } from '../../../src/components/assurance/utils.ts';

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
    const { engagementId, procedureId } = await req.json();
    console.log('Processing assurance analysis for engagement:', engagementId);
    
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch comprehensive engagement data
    const [
      { data: engagement },
      { data: procedures },
      { data: evidence },
      { data: previousAnalysis }
    ] = await Promise.all([
      supabase
        .from('assurance_engagements')
        .select('*, client_name, engagement_type, risk_assessment, findings')
        .eq('id', engagementId)
        .single(),
      supabase
        .from('assurance_procedures')
        .select('*')
        .eq('engagement_id', engagementId),
      supabase
        .from('assurance_evidence')
        .select('*')
        .eq('engagement_id', engagementId),
      supabase
        .from('ai_assurance_analysis')
        .select('*')
        .eq('engagement_id', engagementId)
        .order('created_at', { ascending: false })
        .limit(1)
    ]);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare comprehensive context for AI analysis
    const analysisContext = {
      engagement: {
        clientName: engagement.client_name,
        type: engagement.engagement_type,
        riskAssessment: engagement.risk_assessment,
        existingFindings: engagement.findings
      },
      procedures: procedures?.map(p => ({
        type: p.procedure_type,
        description: p.description,
        status: p.status,
        results: p.results
      })),
      evidence: evidence?.map(e => ({
        type: e.evidence_type,
        description: e.description,
        reliability: e.reliability_score,
        metadata: e.metadata
      })),
      historicalAnalysis: previousAnalysis?.[0]
    };

    // Get specific prompt based on engagement type
    const typeSpecificPrompt = getEngagementAnalysisPrompt(engagement.engagement_type);

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
            content: `${typeSpecificPrompt}\n\nAnalyze this assurance engagement data:\n${JSON.stringify(analysisContext, null, 2)}`
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
    const riskScore = calculateRiskScore(analysis, analysisContext);
    const confidenceScore = calculateConfidenceScore(analysis, analysisContext);
    const findings = extractFindings(analysis);
    const recommendations = extractRecommendations(analysis);
    const evidenceValidation = validateEvidence(analysis, evidence);
    const nlpAnalysis = performNLPAnalysis(analysis, analysisContext);

    // Store analysis results
    const { data, error } = await supabase
      .from('ai_assurance_analysis')
      .insert({
        engagement_id: engagementId,
        procedure_id: procedureId,
        analysis_type: 'comprehensive',
        risk_score: riskScore,
        confidence_score: confidenceScore,
        findings,
        recommendations,
        evidence_validation: evidenceValidation,
        nlp_analysis: nlpAnalysis,
      })
      .select()
      .single();

    if (error) throw error;

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

function calculateRiskScore(analysis: string, context: any): number {
  const riskIndicators = analysis.toLowerCase().match(/risk|concern|issue|problem/g)?.length || 0;
  const contextualRisk = context.engagement.riskAssessment?.level === 'high' ? 0.3 : 0;
  const evidenceRisk = context.evidence.some((e: any) => e.reliability < 0.7) ? 0.2 : 0;
  return Math.min(Math.max((riskIndicators * 0.1) + contextualRisk + evidenceRisk, 0), 1);
}

function calculateConfidenceScore(analysis: string, context: any): number {
  const confidenceIndicators = analysis.toLowerCase().match(/confident|certain|clear|evident/g)?.length || 0;
  const evidenceReliability = context.evidence.reduce((acc: number, e: any) => acc + (e.reliability || 0), 0) / context.evidence.length;
  return Math.min(Math.max((confidenceIndicators * 0.1) + (evidenceReliability * 0.5), 0), 1);
}

function extractFindings(analysis: string): any[] {
  return analysis.split('\n')
    .filter(line => line.toLowerCase().includes('finding:'))
    .map(finding => ({
      description: finding.replace(/^finding:/i, '').trim(),
      severity: determineSeverity(finding),
    }));
}

function extractRecommendations(analysis: string): any[] {
  return analysis.split('\n')
    .filter(line => line.toLowerCase().includes('recommend:'))
    .map(rec => ({
      description: rec.replace(/^recommend:/i, '').trim(),
      priority: determinePriority(rec),
    }));
}

function validateEvidence(analysis: string, evidenceData: any): any {
  return {
    isValid: !analysis.toLowerCase().includes('insufficient evidence'),
    completeness: calculateCompleteness(evidenceData),
    reliability: calculateReliability(analysis),
    validationNotes: extractValidationNotes(analysis),
  };
}

function performNLPAnalysis(analysis: string, documentText: string): any {
  return {
    keyPhrases: extractKeyPhrases(documentText),
    sentiment: analyzeSentiment(documentText),
    entities: extractEntities(documentText),
  };
}

function determineSeverity(finding: string): string {
  const text = finding.toLowerCase();
  if (text.includes('critical') || text.includes('severe')) return 'high';
  if (text.includes('moderate') || text.includes('medium')) return 'medium';
  return 'low';
}

function determinePriority(recommendation: string): string {
  const text = recommendation.toLowerCase();
  if (text.includes('immediate') || text.includes('urgent')) return 'high';
  if (text.includes('soon') || text.includes('consider')) return 'medium';
  return 'low';
}

function calculateCompleteness(evidenceData: any): number {
  const requiredFields = ['description', 'source', 'date'];
  const availableFields = requiredFields.filter(field => evidenceData[field]);
  return availableFields.length / requiredFields.length;
}

function calculateReliability(analysis: string): number {
  const reliabilityIndicators = analysis.toLowerCase().match(/reliable|accurate|verified|valid/g)?.length || 0;
  return Math.min(Math.max(reliabilityIndicators * 0.2, 0), 1);
}

function extractValidationNotes(analysis: string): string[] {
  return analysis.split('\n')
    .filter(line => line.toLowerCase().includes('validation:'))
    .map(note => note.replace(/^validation:/i, '').trim());
}

function extractKeyPhrases(text: string): string[] {
  return text.split(/[.!?]/)
    .filter(sentence => sentence.length > 10)
    .map(sentence => sentence.trim());
}

function analyzeSentiment(text: string): string {
  const positiveWords = text.toLowerCase().match(/good|excellent|positive|successful/g)?.length || 0;
  const negativeWords = text.toLowerCase().match(/bad|poor|negative|failed/g)?.length || 0;
  if (positiveWords > negativeWords) return 'positive';
  if (negativeWords > positiveWords) return 'negative';
  return 'neutral';
}

function extractEntities(text: string): string[] {
  const entities = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  return [...new Set(entities)];
}
