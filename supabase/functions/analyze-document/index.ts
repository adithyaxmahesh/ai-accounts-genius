import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from './utils.ts'
import { processDocument, updateFinancialRecords } from './documentProcessor.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentId } = await req.json();
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get document metadata and user ID
    const { data: document, error: docError } = await supabaseClient
      .from('processed_documents')
      .select('*, user_id')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    // Download file content
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError) throw downloadError;

    // Process document
    const analysis = await processDocument(supabaseClient, document, fileData);

    // Update document status
    await supabaseClient
      .from('processed_documents')
      .update({
        extracted_data: { transactions: analysis.transactions, findings: analysis.findings },
        processing_status: 'analyzed',
        confidence_score: 0.85
      })
      .eq('id', documentId);

    // Update financial records
    await updateFinancialRecords(supabaseClient, document.user_id, analysis.transactions);

    // Generate new forecast
    await supabaseClient.functions.invoke('generate-forecast', {
      body: { userId: document.user_id }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        findings: analysis.findings,
        riskLevel: analysis.riskLevel,
        recommendations: analysis.recommendations
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in document analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});