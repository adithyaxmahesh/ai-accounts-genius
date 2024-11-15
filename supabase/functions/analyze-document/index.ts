import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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
    console.log('Processing document:', documentId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get document data
    const { data: document, error: docError } = await supabase
      .from('processed_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError) {
      console.error('Error fetching document:', docError)
      throw new Error('Document not found')
    }

    // Get document content from storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from('documents')
      .download(document.storage_path)

    if (storageError) {
      console.error('Error downloading file:', storageError)
      throw new Error('Failed to download document')
    }

    const text = await fileData.text()
    console.log('Document text extracted successfully')

    // Analyze with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI accountant. Your task is to scan the document and extract ONLY financial information, focusing on prices, amounts, and monetary values. Return the data in this JSON format: { "amounts": [{"value": number, "context": "string"}], "total": number, "currency": "string" }. If no amounts are found, return empty arrays and null values.'
          },
          {
            role: 'user',
            content: text
          }
        ],
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text())
      throw new Error('Failed to analyze document')
    }

    const analysis = await response.json()
    console.log('OpenAI analysis completed')

    const extractedData = analysis.choices[0].message.content
    
    // Update document with extracted data and confidence score
    const { error: updateError } = await supabase
      .from('processed_documents')
      .update({
        extracted_data: JSON.parse(extractedData),
        confidence_score: 0.95,
        processing_status: 'completed',
        document_type: 'financial'
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error updating document:', updateError)
      throw new Error('Failed to save analysis results')
    }

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in analyze-document function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})