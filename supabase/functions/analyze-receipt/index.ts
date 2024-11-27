import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../analyze-document/utils.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentId } = await req.json()
    if (!documentId) {
      throw new Error('Document ID is required')
    }

    console.log('Starting receipt analysis for document:', documentId)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get document metadata and content
    const { data: document, error: docError } = await supabase
      .from('processed_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError) throw docError

    // Download the receipt image
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path)

    if (downloadError) throw downloadError

    // Convert image to base64
    const base64Image = await fileData.arrayBuffer().then(buffer => 
      btoa(String.fromCharCode(...new Uint8Array(buffer)))
    )

    console.log('Analyzing receipt with OpenAI Vision...')

    // Use OpenAI's GPT-4 Vision to analyze the receipt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this receipt and extract the following information in JSON format: date, merchant_name, total_amount, items (array of {description, amount}), and whether this appears to be a business expense. Also suggest an expense category from these options: Transportation, Office, Marketing, Travel, Equipment, Services, Other. Return a confidence score between 0 and 1.'
              },
              {
                type: 'image_url',
                image_url: `data:image/jpeg;base64,${base64Image}`
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    })

    const analysisResult = await response.json()
    const extractedData = JSON.parse(analysisResult.choices[0].message.content)

    console.log('Receipt analysis completed:', extractedData)

    // Get matching tax code for the expense category
    const { data: taxCode } = await supabase
      .from('tax_codes')
      .select('id')
      .eq('expense_category', extractedData.expense_category)
      .single()

    // Store analysis results
    const { error: analysisError } = await supabase
      .from('receipt_analysis')
      .insert({
        user_id: document.user_id,
        receipt_url: document.storage_path,
        extracted_data: extractedData,
        confidence_score: extractedData.confidence_score,
        ocr_text: extractedData.raw_text,
        ocr_confidence: extractedData.confidence_score
      })

    if (analysisError) throw analysisError

    // Create write-off entry if it's a business expense
    if (extractedData.is_business_expense) {
      console.log('Creating write-off entry...')
      const { error: writeOffError } = await supabase
        .from('write_offs')
        .insert({
          user_id: document.user_id,
          amount: extractedData.total_amount,
          description: `${extractedData.merchant_name} - ${extractedData.items?.map(item => item.description).join(', ')}`,
          date: extractedData.date,
          tax_code_id: taxCode?.id,
          status: 'pending'
        })

      if (writeOffError) {
        console.error('Error creating write-off:', writeOffError)
        throw writeOffError
      }
    }

    // Update document status
    await supabase
      .from('processed_documents')
      .update({
        processing_status: 'Analyzed',
        extracted_data: extractedData,
        confidence_score: extractedData.confidence_score
      })
      .eq('id', documentId)

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error analyzing receipt:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})