import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { description, amount } = await req.json()
    console.log('Categorizing write-off:', { description, amount })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all tax codes
    const { data: taxCodes, error: taxCodesError } = await supabase
      .from('tax_codes')
      .select('*')
      .order('expense_category')

    if (taxCodesError) {
      throw taxCodesError
    }

    // Simple keyword matching for demonstration
    const keywords = {
      'Transportation': ['fuel', 'car', 'vehicle', 'mileage', 'parking', 'toll'],
      'Office': ['supplies', 'paper', 'printer', 'desk', 'chair', 'computer'],
      'Marketing': ['advertising', 'promotion', 'campaign', 'marketing'],
      'Travel': ['hotel', 'flight', 'accommodation', 'travel'],
      'Equipment': ['machine', 'equipment', 'tool', 'hardware'],
      'Services': ['consulting', 'service', 'subscription', 'software']
    }

    let bestMatch = null
    const descLower = description.toLowerCase()

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => descLower.includes(word))) {
        const matchingTaxCode = taxCodes?.find(code => 
          code.expense_category === category
        )
        if (matchingTaxCode) {
          bestMatch = matchingTaxCode
          break
        }
      }
    }

    console.log('Found matching tax code:', bestMatch)

    return new Response(
      JSON.stringify({ 
        success: true,
        taxCode: bestMatch || taxCodes?.[0]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in categorize-write-off:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})