import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders, validateEnvironment, parseFileContent, analyzeWithRules } from './utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting document analysis...');
    
    const { supabaseUrl, supabaseKey } = validateEnvironment();
    const { documentId } = await req.json();
    
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    
    console.log('Processing document:', documentId);
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Get document metadata and user ID
    const { data: document, error: docError } = await supabaseClient
      .from('processed_documents')
      .select('*, user_id')
      .eq('id', documentId)
      .single();

    if (docError) {
      console.error('Error fetching document:', docError);
      throw docError;
    }

    console.log('Retrieved document:', document.id, 'for user:', document.user_id);

    // Download file content
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw downloadError;
    }

    console.log('Successfully downloaded file, parsing content...');

    // Parse and analyze file content
    const fileExt = document.storage_path.split('.').pop()?.toLowerCase();
    const parsedData = await parseFileContent(fileData, fileExt);
    console.log('File parsed, analyzing with rules...');
    
    const analysis = await analyzeWithRules(parsedData);
    console.log('Analysis complete:', analysis);

    // Update document status
    const { error: updateError } = await supabaseClient
      .from('processed_documents')
      .update({
        extracted_data: analysis,
        processing_status: 'analyzed',
        confidence_score: analysis.confidence_score
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document status:', updateError);
      throw updateError;
    }

    // Create or update audit report
    const { data: existingAudit } = await supabaseClient
      .from('audit_reports')
      .select('id')
      .eq('user_id', document.user_id)
      .eq('status', 'evidence_gathering')
      .single();

    let auditId = existingAudit?.id;

    if (!auditId) {
      const { data: newAudit, error: createError } = await supabaseClient
        .from('audit_reports')
        .insert({
          title: `Document Analysis Audit ${new Date().toLocaleDateString()}`,
          status: 'evidence_gathering',
          user_id: document.user_id,
          findings: analysis.findings,
          risk_level: analysis.risk_level,
          recommendations: analysis.recommendations
        })
        .select()
        .single();

      if (createError) throw createError;
      auditId = newAudit.id;
    }

    // Create audit items from analysis
    if (analysis.transactions?.length > 0) {
      const auditItems = analysis.transactions.map((transaction: any) => ({
        audit_id: auditId,
        category: transaction.category || 'Uncategorized',
        description: transaction.description || 'Transaction from document analysis',
        amount: transaction.amount || 0,
        status: transaction.flagged ? 'flagged' : 'pending'
      }));

      const { error: itemsError } = await supabaseClient
        .from('audit_items')
        .insert(auditItems);

      if (itemsError) throw itemsError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        auditId
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