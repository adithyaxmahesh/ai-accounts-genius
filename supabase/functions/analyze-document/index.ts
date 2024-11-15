import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentId } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get document content and metadata
    const { data: document, error: docError } = await supabaseClient
      .from('processed_documents')
      .select('*, user_id')
      .eq('id', documentId)
      .single()

    if (docError) throw docError

    // Download file content from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(document.storage_path)

    if (downloadError) throw downloadError

    const text = await fileData.text()

    // Analyze document content with OpenAI
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
            content: 'You are a document analysis AI. Extract key information, identify potential fraud indicators, and suggest audit implications.'
          },
          {
            role: 'user',
            content: `Analyze this document and extract: 1) Key financial information 2) Potential fraud indicators 3) Audit implications\n\nDocument content: ${text}`
          }
        ],
      }),
    })

    const aiResponse = await response.json()
    const analysis = aiResponse.choices[0].message.content

    // Update document with analysis
    const { error: updateError } = await supabaseClient
      .from('processed_documents')
      .update({
        extracted_data: { analysis },
        processing_status: 'analyzed',
        confidence_score: 0.95 // Default high confidence for GPT-4 analysis
      })
      .eq('id', documentId)

    if (updateError) throw updateError

    // Create fraud alert if suspicious patterns found
    if (analysis.toLowerCase().includes('suspicious') || 
        analysis.toLowerCase().includes('irregular') || 
        analysis.toLowerCase().includes('unusual')) {
      await supabaseClient
        .from('fraud_alerts')
        .insert({
          user_id: document.user_id,
          alert_type: 'document_analysis',
          risk_score: 0.7,
          details: {
            analysis: `Suspicious patterns detected in document: ${document.original_filename}\n\n${analysis}`,
            document_id: documentId
          },
          status: 'pending'
        })
    }

    // Create or update audit items based on document analysis
    const { data: existingAudit } = await supabaseClient
      .from('audit_reports')
      .select('id')
      .eq('user_id', document.user_id)
      .eq('status', 'in_progress')
      .single()

    if (existingAudit) {
      await supabaseClient
        .from('audit_items')
        .insert({
          audit_id: existingAudit.id,
          category: 'document_review',
          description: `Analysis of ${document.original_filename}`,
          status: analysis.toLowerCase().includes('suspicious') ? 'flagged' : 'pending'
        })
    }

    // Create AI insights from document analysis
    await supabaseClient
      .from('ai_insights')
      .insert({
        user_id: document.user_id,
        category: 'document_analysis',
        insight: analysis,
        confidence_score: 0.95
      })

    // Update tax analysis if tax implications are found
    if (analysis.toLowerCase().includes('tax') || 
        analysis.toLowerCase().includes('deduction') || 
        analysis.toLowerCase().includes('write-off')) {
      await supabaseClient
        .from('tax_analysis')
        .insert({
          user_id: document.user_id,
          analysis_type: 'document_review',
          recommendations: { suggestions: analysis },
          jurisdiction: 'US' // Default to US
        })
    }

    console.log('Document analysis completed:', { documentId, analysis })

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        hasAuditImplications: !!existingAudit,
        hasFraudIndicators: analysis.toLowerCase().includes('suspicious'),
        hasTaxImplications: analysis.toLowerCase().includes('tax')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in document analysis:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})