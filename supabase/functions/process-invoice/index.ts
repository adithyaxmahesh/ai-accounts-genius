import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    console.log('Starting invoice processing...');
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { invoiceId } = await req.json();

    // Get invoice data
    const { data: invoice, error: fetchError } = await supabase
      .from('processed_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError) throw fetchError;

    // Get the file content from storage
    const { data: fileData, error: storageError } = await supabase.storage
      .from('documents')
      .download(invoice.storage_path);

    if (storageError) throw storageError;

    // Convert file to text
    const text = await fileData.text();
    console.log('Successfully retrieved invoice text');

    // Process with OpenAI
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
            content: 'You are an expert at analyzing invoices and categorizing expenses for tax purposes. Extract key information and suggest tax categories.'
          },
          {
            role: 'user',
            content: `Analyze this invoice content and extract: total amount, date, due date, vendor name, line items, and suggest tax categories for each line item. Format as JSON. Invoice content: ${text}`
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
    console.log('Successfully received OpenAI analysis');
    const analysis = JSON.parse(aiResponse.choices[0].message.content);

    // Update invoice with extracted data
    const { error: updateError } = await supabase
      .from('processed_invoices')
      .update({
        extracted_data: analysis,
        total_amount: analysis.total_amount,
        invoice_date: analysis.date,
        due_date: analysis.due_date,
        vendor_name: analysis.vendor_name,
        line_items: analysis.line_items,
        suggested_categories: analysis.tax_categories,
        status: 'processed',
        confidence_score: 0.85
      })
      .eq('id', invoiceId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, data: analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});