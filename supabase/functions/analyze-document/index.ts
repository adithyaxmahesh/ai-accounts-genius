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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentId } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured')
      throw new Error('OpenAI API key is not configured')
    }

    console.log('Processing document:', documentId)
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get document metadata
    const { data: document, error: docError } = await supabaseClient
      .from('processed_documents')
      .select('*, user_id')
      .eq('id', documentId)
      .single()

    if (docError) {
      console.error('Error fetching document:', docError)
      throw docError
    }

    console.log('Document type:', document.document_type)

    // Download file content
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(document.storage_path)

    if (downloadError) {
      console.error('Error downloading file:', downloadError)
      throw downloadError
    }

    // Parse file content based on type
    let parsedData = []
    const fileExt = document.storage_path.split('.').pop()?.toLowerCase()
    
    console.log('Parsing file with extension:', fileExt)

    try {
      if (fileExt === 'csv') {
        const text = await fileData.text()
        parsedData = await parseCSV(text, { skipFirstRow: true })
      } else if (['xls', 'xlsx'].includes(fileExt)) {
        const arrayBuffer = await fileData.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        parsedData = XLSX.utils.sheet_to_json(firstSheet)
      } else {
        throw new Error(`Unsupported file type: ${fileExt}`)
      }

      console.log('Successfully parsed data, row count:', parsedData.length)
    } catch (parseError) {
      console.error('Error parsing file:', parseError)
      throw new Error(`Failed to parse ${fileExt} file: ${parseError.message}`)
    }

    if (parsedData.length === 0) {
      throw new Error('No data found in file')
    }

    // Analyze data with OpenAI
    console.log('Sending data to OpenAI for analysis')
    
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
            content: `Analyze this spreadsheet data:\n${JSON.stringify(parsedData.slice(0, 100), null, 2)}`
          }
        ],
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      throw new Error('Failed to analyze document with OpenAI')
    }

    const aiResponse = await response.json()
    console.log('Received analysis from OpenAI')

    let analysis
    try {
      analysis = JSON.parse(aiResponse.choices[0].message.content)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      throw new Error('Invalid response format from OpenAI')
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

    if (updateError) {
      console.error('Error updating document:', updateError)
      throw updateError
    }

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

    console.log('Successfully updated audit findings')

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
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})