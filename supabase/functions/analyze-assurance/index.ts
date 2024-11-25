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
    const { engagementId, procedureId, evidenceData, documentText } = await req.json();
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

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
            content: 'You are an AI auditor analyzing assurance procedures and evidence. Provide detailed analysis including risk assessment, evidence validation, and recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this assurance data:\nEvidence: ${JSON.stringify(evidenceData)}\nDocument Text: ${documentText}`
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    // Process the AI response
    const riskScore = calculateRiskScore(analysis);
    const confidenceScore = calculateConfidenceScore(analysis);
    const findings = extractFindings(analysis);
    const recommendations = extractRecommendations(analysis);
    const evidenceValidation = validateEvidence(analysis, evidenceData);
    const nlpAnalysis = performNLPAnalysis(analysis, documentText);

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

// Helper functions
function calculateRiskScore(analysis: string): number {
  // Implement risk scoring logic based on AI analysis
  const riskIndicators = analysis.toLowerCase().match(/risk|concern|issue|problem/g)?.length || 0;
  return Math.min(Math.max(riskIndicators * 0.2, 0), 1);
}

function calculateConfidenceScore(analysis: string): number {
  // Implement confidence scoring logic
  const confidenceIndicators = analysis.toLowerCase().match(/confident|certain|clear|evident/g)?.length || 0;
  return Math.min(Math.max(confidenceIndicators * 0.25, 0), 1);
}

function extractFindings(analysis: string): any[] {
  // Extract key findings from AI analysis
  const findings = analysis.split('\n')
    .filter(line => line.toLowerCase().includes('finding:'))
    .map(finding => ({
      description: finding.replace(/^finding:/i, '').trim(),
      severity: determineSeverity(finding),
    }));
  return findings;
}

function extractRecommendations(analysis: string): any[] {
  // Extract recommendations from AI analysis
  const recommendations = analysis.split('\n')
    .filter(line => line.toLowerCase().includes('recommend:'))
    .map(rec => ({
      description: rec.replace(/^recommend:/i, '').trim(),
      priority: determinePriority(rec),
    }));
  return recommendations;
}

function validateEvidence(analysis: string, evidenceData: any): any {
  // Validate evidence based on AI analysis
  return {
    isValid: !analysis.toLowerCase().includes('insufficient evidence'),
    completeness: calculateCompleteness(evidenceData),
    reliability: calculateReliability(analysis),
    validationNotes: extractValidationNotes(analysis),
  };
}

function performNLPAnalysis(analysis: string, documentText: string): any {
  // Perform NLP analysis on documents
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
  // Calculate evidence completeness score
  const requiredFields = ['description', 'source', 'date'];
  const availableFields = requiredFields.filter(field => evidenceData[field]);
  return availableFields.length / requiredFields.length;
}

function calculateReliability(analysis: string): number {
  // Calculate evidence reliability score
  const reliabilityIndicators = analysis.toLowerCase().match(/reliable|accurate|verified|valid/g)?.length || 0;
  return Math.min(Math.max(reliabilityIndicators * 0.2, 0), 1);
}

function extractValidationNotes(analysis: string): string[] {
  // Extract validation notes from analysis
  return analysis.split('\n')
    .filter(line => line.toLowerCase().includes('validation:'))
    .map(note => note.replace(/^validation:/i, '').trim());
}

function extractKeyPhrases(text: string): string[] {
  // Extract key phrases using basic NLP
  return text.split(/[.!?]/)
    .filter(sentence => sentence.length > 10)
    .map(sentence => sentence.trim());
}

function analyzeSentiment(text: string): string {
  // Basic sentiment analysis
  const positiveWords = text.toLowerCase().match(/good|excellent|positive|successful/g)?.length || 0;
  const negativeWords = text.toLowerCase().match(/bad|poor|negative|failed/g)?.length || 0;
  if (positiveWords > negativeWords) return 'positive';
  if (negativeWords > positiveWords) return 'negative';
  return 'neutral';
}

function extractEntities(text: string): string[] {
  // Basic entity extraction
  const entities = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  return [...new Set(entities)];
}