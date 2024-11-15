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
            content: `You are a financial document analyzer. Extract and analyze:
              1) Key financial information (amounts, dates, categories)
              2) Tax implications (deductions, write-offs, tax codes)
              3) Potential fraud indicators
              4) Audit findings
              Format the response as JSON with these sections.`
          },
          {
            role: 'user',
            content: `Analyze this document and provide structured findings:\n\n${text}`
          }
        ],
      }),
    })

    const aiResponse = await response.json()
    const analysis = aiResponse.choices[0].message.content
    const parsedAnalysis = JSON.parse(analysis)

    // Update document with analysis
    const { error: updateError } = await supabaseClient
      .from('processed_documents')
      .update({
        extracted_data: parsedAnalysis,
        processing_status: 'analyzed',
        confidence_score: 0.95
      })
      .eq('id', documentId)

    if (updateError) throw updateError

    // Create or update audit items based on document analysis
    if (parsedAnalysis.audit_findings) {
      const { data: existingAudit } = await supabaseClient
        .from('audit_reports')
        .select('id')
        .eq('user_id', document.user_id)
        .eq('status', 'in_progress')
        .single()

      const auditId = existingAudit?.id

      if (auditId) {
        // Add audit items
        await supabaseClient
          .from('audit_items')
          .insert(parsedAnalysis.audit_findings.map(finding => ({
            audit_id: auditId,
            category: finding.category,
            description: finding.description,
            amount: finding.amount,
            status: finding.risk_level === 'high' ? 'flagged' : 'pending'
          })))
      }
    }

    // Create fraud alerts if suspicious patterns found
    if (parsedAnalysis.fraud_indicators?.length > 0) {
      await supabaseClient
        .from('fraud_alerts')
        .insert({
          user_id: document.user_id,
          alert_type: 'document_analysis',
          risk_score: parsedAnalysis.fraud_indicators.length > 2 ? 0.8 : 0.6,
          details: {
            analysis: parsedAnalysis.fraud_indicators.join('\n'),
            document_id: documentId
          },
          status: 'pending'
        })
    }

    // Process tax implications
    if (parsedAnalysis.tax_implications) {
      // Create tax analysis entry
      await supabaseClient
        .from('tax_analysis')
        .insert({
          user_id: document.user_id,
          analysis_type: 'document_review',
          recommendations: parsedAnalysis.tax_implications,
          jurisdiction: parsedAnalysis.tax_implications.jurisdiction || 'US'
        })

      // Create write-offs if applicable
      if (parsedAnalysis.tax_implications.write_offs) {
        for (const writeOff of parsedAnalysis.tax_implications.write_offs) {
          await supabaseClient
            .from('write_offs')
            .insert({
              user_id: document.user_id,
              amount: writeOff.amount,
              description: writeOff.description,
              date: writeOff.date || new Date().toISOString(),
              tax_code_id: writeOff.tax_code_id,
              status: 'pending'
            })
        }
      }
    }

    // Create AI insights
    await supabaseClient
      .from('ai_insights')
      .insert({
        user_id: document.user_id,
        category: 'document_analysis',
        insight: JSON.stringify(parsedAnalysis.key_findings),
        confidence_score: 0.95
      })

    console.log('Document analysis completed:', { 
      documentId, 
      hasAuditFindings: !!parsedAnalysis.audit_findings,
      hasFraudIndicators: !!parsedAnalysis.fraud_indicators,
      hasTaxImplications: !!parsedAnalysis.tax_implications
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: parsedAnalysis,
        hasAuditFindings: !!parsedAnalysis.audit_findings,
        hasFraudIndicators: !!parsedAnalysis.fraud_indicators,
        hasTaxImplications: !!parsedAnalysis.tax_implications
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