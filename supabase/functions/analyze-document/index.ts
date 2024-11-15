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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a financial document analyzer. Extract and analyze:
              1) Key financial information (amounts, dates, categories)
              2) Tax implications (deductions, write-offs, tax codes)
              3) Potential fraud indicators
              4) Audit findings
              Format the response as JSON with these sections.
              For each transaction or financial item found, include:
              - amount (numeric)
              - category (string)
              - description (string)
              - risk_level (string: low, medium, high)
              - status (string: pending, flagged, approved)
              - date (string in ISO format)`
          },
          {
            role: 'user',
            content: `Analyze this document and provide structured findings:\n\n${text}`
          }
        ],
      }),
    })

    const aiResponse = await response.json()
    const analysis = JSON.parse(aiResponse.choices[0].message.content)

    // Get or create an active audit for the user
    const { data: existingAudit } = await supabaseClient
      .from('audit_reports')
      .select('id')
      .eq('user_id', document.user_id)
      .eq('status', 'in_progress')
      .single()

    let auditId = existingAudit?.id

    if (!auditId) {
      // Create new audit if none exists
      const { data: newAudit, error: auditError } = await supabaseClient
        .from('audit_reports')
        .insert({
          user_id: document.user_id,
          title: `Audit Report ${new Date().toLocaleDateString()}`,
          status: 'in_progress',
          risk_level: analysis.fraud_indicators?.length > 0 ? 'high' : 'low',
          description: 'Automated audit from document analysis'
        })
        .select()
        .single()

      if (auditError) throw auditError
      auditId = newAudit.id
    }

    // Create audit items from the analysis
    if (analysis.financial_items) {
      const auditItems = analysis.financial_items.map(item => ({
        audit_id: auditId,
        category: item.category,
        description: item.description,
        amount: item.amount,
        status: item.risk_level === 'high' ? 'flagged' : 'pending'
      }))

      const { error: itemsError } = await supabaseClient
        .from('audit_items')
        .insert(auditItems)

      if (itemsError) throw itemsError
    }

    // Update document with analysis results
    const { error: updateError } = await supabaseClient
      .from('processed_documents')
      .update({
        extracted_data: analysis,
        processing_status: 'analyzed',
        confidence_score: 0.95
      })
      .eq('id', documentId)

    if (updateError) throw updateError

    // Create fraud alerts if suspicious patterns found
    if (analysis.fraud_indicators?.length > 0) {
      await supabaseClient
        .from('fraud_alerts')
        .insert({
          user_id: document.user_id,
          alert_type: 'document_analysis',
          risk_score: analysis.fraud_indicators.length > 2 ? 0.8 : 0.6,
          details: {
            analysis: analysis.fraud_indicators,
            document_id: documentId
          },
          status: 'pending'
        })
    }

    // Process tax implications
    if (analysis.tax_implications) {
      await supabaseClient
        .from('tax_analysis')
        .insert({
          user_id: document.user_id,
          analysis_type: 'document_review',
          recommendations: analysis.tax_implications,
          jurisdiction: analysis.tax_implications.jurisdiction || 'US'
        })

      // Create write-offs if applicable
      if (analysis.tax_implications.write_offs) {
        const writeOffs = analysis.tax_implications.write_offs.map(writeOff => ({
          user_id: document.user_id,
          amount: writeOff.amount,
          description: writeOff.description,
          date: writeOff.date || new Date().toISOString(),
          tax_code_id: writeOff.tax_code_id,
          status: 'pending'
        }))

        await supabaseClient
          .from('write_offs')
          .insert(writeOffs)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        auditId,
        hasAuditFindings: true,
        hasFraudIndicators: analysis.fraud_indicators?.length > 0,
        hasTaxImplications: !!analysis.tax_implications
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