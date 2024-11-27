import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from './utils.ts'
import { processDocument } from './documentProcessor.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentId } = await req.json();
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    console.log('Starting document analysis for document:', documentId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Update document status to Processing
    await supabaseClient
      .from('processed_documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    // Get document metadata and user ID
    const { data: document, error: docError } = await supabaseClient
      .from('processed_documents')
      .select('*, user_id')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    console.log('Retrieved document metadata:', document.original_filename);

    // Download file content
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError) throw downloadError;

    console.log('Downloaded file content successfully');

    // Process document and detect write-offs
    const analysis = await processDocument(supabaseClient, document, fileData);

    console.log('Document analysis completed successfully');

    // Update document status and extracted data
    await supabaseClient
      .from('processed_documents')
      .update({
        extracted_data: {
          transactions: analysis.transactions,
          findings: analysis.findings,
          writeOffs: analysis.writeOffs
        },
        processing_status: 'analyzed',
        confidence_score: 0.85
      })
      .eq('id', documentId);

    return new Response(
      JSON.stringify({ 
        success: true,
        findings: analysis.findings,
        riskLevel: analysis.riskLevel,
        recommendations: analysis.recommendations,
        writeOffs: analysis.writeOffs
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in document analysis:', error);
    
    // Update document status to error if we have a document ID
    try {
      const { documentId } = await req.json();
      if (documentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (supabaseUrl && supabaseKey) {
          const supabaseClient = createClient(supabaseUrl, supabaseKey);
          await supabaseClient
            .from('processed_documents')
            .update({ 
              processing_status: 'error',
              extracted_data: {
                error: error.message
              }
            })
            .eq('id', documentId);
        }
      }
    } catch (updateError) {
      console.error('Error updating document status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    );
  }
});