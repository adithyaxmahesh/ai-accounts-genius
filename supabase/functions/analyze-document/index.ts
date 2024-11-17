import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse as parseCSV } from 'https://deno.land/std@0.181.0/encoding/csv.ts'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

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

    // Parse file content based on type
    let parsedData = [];
    const fileExt = document.storage_path.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'csv') {
      const text = await fileData.text()
      parsedData = await parseCSV(text, { skipFirstRow: true })
    } else if (['xls', 'xlsx'].includes(fileExt)) {
      const arrayBuffer = await fileData.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      parsedData = XLSX.utils.sheet_to_json(firstSheet)
    }

    // Analyze data with OpenAI
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
            content: `You are a financial document analyzer. Analyze this spreadsheet data and provide:
              1) Summary of transactions/entries
              2) Potential anomalies or suspicious patterns
              3) Tax implications
              4) Compliance concerns
              5) Risk assessment
              Format response as JSON with these sections.`
          },
          {
            role: 'user',
            content: `Analyze this spreadsheet data:\n${JSON.stringify(parsedData, null, 2)}`
          }
        ],
      }),
    })

    const aiResponse = await response.json()
    const analysis = JSON.parse(aiResponse.choices[0].message.content)

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

    // Create or update audit findings
    const { data: existingAudit } = await supabaseClient
      .from('audit_reports')
      .select('id')
      .eq('user_id', document.user_id)
      .eq('status', 'evidence_gathering')
      .single()

    const auditFindings = analysis.anomalies?.map(anomaly => ({
      category: 'Financial Review',
      description: anomaly.description,
      impact: anomaly.impact || 'Unknown',
      severity: anomaly.risk_level || 'medium',
      status: 'pending',
      details: anomaly.details || []
    })) || []

    if (existingAudit?.id) {
      await supabaseClient
        .from('audit_reports')
        .update({
          findings: auditFindings,
          risk_level: analysis.risk_assessment?.overall_risk || 'low',
          recommendations: analysis.recommendations || []
        })
        .eq('id', existingAudit.id)
    }

    // Create fraud alerts if needed
    if (analysis.anomalies?.some(a => a.risk_level === 'high')) {
      await supabaseClient
        .from('fraud_alerts')
        .insert({
          user_id: document.user_id,
          alert_type: 'document_analysis',
          risk_score: 0.8,
          details: {
            document_id: documentId,
            findings: analysis.anomalies.filter(a => a.risk_level === 'high')
          }
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        hasAuditFindings: auditFindings.length > 0
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