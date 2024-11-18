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
    console.log('Starting document analysis...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }
    
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

    // Download file content
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw downloadError;
    }

    // Analyze content
    const text = await fileData.text();
    const lines = text.split('\n');
    
    // Extract potential findings
    const findings = [];
    const transactions = [];
    let riskLevel = 'low';

    // Basic pattern matching for financial data
    const numberPattern = /\$?\d{1,3}(,\d{3})*(\.\d{2})?/;
    let totalAmount = 0;
    let suspiciousTransactions = 0;

    lines.forEach((line, index) => {
      const matches = line.match(numberPattern);
      if (matches) {
        const amount = parseFloat(matches[0].replace(/[$,]/g, ''));
        if (!isNaN(amount)) {
          totalAmount += amount;
          transactions.push({
            amount,
            description: line.trim(),
            line: index + 1
          });

          if (amount > 10000) {
            findings.push(`Large transaction detected: $${amount.toLocaleString()} on line ${index + 1}`);
            suspiciousTransactions++;
          }
        }
      }
    });

    // Determine risk level based on findings
    if (suspiciousTransactions > 5) {
      riskLevel = 'high';
    } else if (suspiciousTransactions > 2) {
      riskLevel = 'medium';
    }

    // Generate recommendations
    const recommendations = [
      "Review all transactions above $10,000",
      "Verify supporting documentation for large transactions",
      "Consider implementing additional controls for high-value transactions"
    ];

    if (suspiciousTransactions > 0) {
      recommendations.push(`Review ${suspiciousTransactions} flagged transactions`);
    }

    // Update document status
    const { error: updateError } = await supabaseClient
      .from('processed_documents')
      .update({
        extracted_data: { transactions, findings },
        processing_status: 'analyzed',
        confidence_score: 0.85
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    // Create or update audit report
    const { data: existingAudit } = await supabaseClient
      .from('audit_reports')
      .select('id')
      .eq('document_id', documentId)
      .single();

    const auditData = {
      title: `Document Analysis Audit ${new Date().toLocaleDateString()}`,
      status: 'evidence_gathering',
      document_id: documentId,
      user_id: document.user_id,
      findings,
      risk_level: riskLevel,
      recommendations,
      description: `Analysis of document ${document.original_filename}`
    };

    let auditId;
    if (existingAudit?.id) {
      const { error: updateAuditError } = await supabaseClient
        .from('audit_reports')
        .update(auditData)
        .eq('id', existingAudit.id);

      if (updateAuditError) throw updateAuditError;
      auditId = existingAudit.id;
    } else {
      const { data: newAudit, error: createError } = await supabaseClient
        .from('audit_reports')
        .insert([auditData])
        .select()
        .single();

      if (createError) throw createError;
      auditId = newAudit.id;
    }

    // Create audit items from transactions
    if (transactions.length > 0) {
      const auditItems = transactions.map(transaction => ({
        audit_id: auditId,
        category: 'financial_transaction',
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.amount > 10000 ? 'flagged' : 'pending'
      }));

      const { error: itemsError } = await supabaseClient
        .from('audit_items')
        .insert(auditItems);

      if (itemsError) throw itemsError;
    }

    // Trigger fraud detection
    await supabaseClient.functions.invoke('fraud-detection', {
      body: { 
        userId: document.user_id,
        transactions: transactions.map(t => ({
          amount: t.amount,
          description: t.description,
          date: new Date().toISOString()
        }))
      }
    });

    // Generate forecast
    await supabaseClient.functions.invoke('generate-forecast', {
      body: { 
        userId: document.user_id
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        auditId,
        findings,
        riskLevel,
        recommendations
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