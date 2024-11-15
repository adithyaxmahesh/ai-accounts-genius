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
    const { documentId, userId } = await req.json()
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get document content
    const { data: document, error: docError } = await supabaseClient
      .from('processed_documents')
      .select('*')
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
            content: 'You are a document analysis AI. Extract key information and suggest tax implications.'
          },
          {
            role: 'user',
            content: `Analyze this document and extract key financial information: ${text}`
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
        processing_status: 'completed'
      })
      .eq('id', documentId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})