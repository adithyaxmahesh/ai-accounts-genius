import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'
import { corsHeaders, validateEnvironment, parseFileContent, analyzeWithAI } from './utils.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting document analysis...');
    
    // Validate environment and get API key
    const openAIApiKey = validateEnvironment();
    
    // Get document ID from request
    const { documentId } = await req.json();
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    
    console.log('Processing document:', documentId);
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get document metadata
    const { data: document, error: docError } = await supabaseClient
      .from('processed_documents')
      .select('*, user_id')
      .eq('id', documentId)
      .single();

    if (docError) {
      console.error('Error fetching document:', docError);
      throw docError;
    }

    // Download file content
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw downloadError;
    }

    // Parse file content
    const fileExt = document.storage_path.split('.').pop()?.toLowerCase();
    const parsedData = await parseFileContent(fileData, fileExt);

    if (!parsedData || parsedData.length === 0) {
      throw new Error('No data found in file');
    }

    // Analyze data with OpenAI
    const analysis = await analyzeWithAI(openAIApiKey, parsedData);

    // Update document with analysis results
    const { error: updateError } = await supabaseClient
      .from('processed_documents')
      .update({
        extracted_data: analysis,
        processing_status: 'analyzed',
        confidence_score: 0.95
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document:', updateError);
      throw updateError;
    }

    // Create or update audit findings if needed
    const { data: existingAudit } = await supabaseClient
      .from('audit_reports')
      .select('id')
      .eq('user_id', document.user_id)
      .eq('status', 'evidence_gathering')
      .single();

    if (existingAudit?.id && analysis.anomalies) {
      const auditFindings = analysis.anomalies.map(anomaly => ({
        category: 'Financial Review',
        description: anomaly.description,
        impact: anomaly.impact || 'Unknown',
        severity: anomaly.risk_level || 'medium',
        status: 'pending',
        details: anomaly.details || []
      }));

      await supabaseClient
        .from('audit_reports')
        .update({
          findings: auditFindings,
          risk_level: analysis.risk_assessment?.overall_risk || 'low',
          recommendations: analysis.recommendations || []
        })
        .eq('id', existingAudit.id);
    }

    console.log('Document analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        hasAuditFindings: Boolean(analysis.anomalies?.length)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in document analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    );
  }
});