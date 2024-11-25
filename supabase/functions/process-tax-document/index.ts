import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TaxDocumentData {
  totalIncome: number;
  totalDeductions: number;
  taxYear: number;
  documentType: string;
  lineItems: Array<{
    category: string;
    amount: number;
    description: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { documentId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get document metadata and content
    const { data: document, error: docError } = await supabase
      .from('processed_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    // Download file content
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError) throw downloadError;

    // Extract tax-relevant data from the document
    const text = await fileData.text();
    const extractedData = await extractTaxData(text);

    // Update document with extracted tax data
    const { error: updateError } = await supabase
      .from('processed_documents')
      .update({
        extracted_data: extractedData,
        processing_status: 'analyzed'
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    // Create or update tax return record
    const { error: taxReturnError } = await supabase
      .from('tax_returns')
      .upsert({
        user_id: document.user_id,
        tax_year: extractedData.taxYear,
        filing_status: 'draft',
        total_income: extractedData.totalIncome,
        total_deductions: extractedData.totalDeductions,
        taxable_income: extractedData.totalIncome - extractedData.totalDeductions,
        filing_data: extractedData,
        form_type: extractedData.documentType
      });

    if (taxReturnError) throw taxReturnError;

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing tax document:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

async function extractTaxData(text: string): Promise<TaxDocumentData> {
  // This is a simplified implementation. In a real application,
  // you would use more sophisticated OCR and NLP techniques
  const lines = text.split('\n');
  let totalIncome = 0;
  let totalDeductions = 0;
  const lineItems = [];
  let taxYear = new Date().getFullYear() - 1; // Default to previous year
  let documentType = 'unknown';

  // Look for common tax document patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Try to identify document type
    if (lowerLine.includes('w-2')) documentType = 'W2';
    if (lowerLine.includes('1099')) documentType = '1099';
    
    // Look for tax year
    const yearMatch = line.match(/\b20\d{2}\b/);
    if (yearMatch) taxYear = parseInt(yearMatch[0]);
    
    // Look for income items
    if (lowerLine.includes('wages') || lowerLine.includes('salary')) {
      const amount = extractAmount(line);
      if (amount) {
        totalIncome += amount;
        lineItems.push({
          category: 'wages',
          amount,
          description: line
        });
      }
    }
    
    // Look for deduction items
    if (lowerLine.includes('deduction') || lowerLine.includes('expense')) {
      const amount = extractAmount(line);
      if (amount) {
        totalDeductions += amount;
        lineItems.push({
          category: 'deduction',
          amount,
          description: line
        });
      }
    }
  }

  return {
    totalIncome,
    totalDeductions,
    taxYear,
    documentType,
    lineItems
  };
}

function extractAmount(line: string): number {
  const amountMatch = line.match(/\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?/);
  if (amountMatch) {
    return parseFloat(amountMatch[0].replace(/[$,]/g, ''));
  }
  return 0;
}