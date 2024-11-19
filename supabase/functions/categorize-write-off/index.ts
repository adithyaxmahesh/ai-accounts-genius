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

    // Keyword matching for common business expenses
    const keywords = {
      'Transportation': ['fuel', 'car', 'vehicle', 'mileage', 'parking', 'toll', 'uber', 'lyft', 'taxi'],
      'Office': ['supplies', 'paper', 'printer', 'desk', 'chair', 'computer', 'office', 'software', 'subscription'],
      'Marketing': ['advertising', 'promotion', 'campaign', 'marketing', 'ads', 'social media'],
      'Travel': ['hotel', 'flight', 'accommodation', 'travel', 'lodging', 'airfare', 'airline'],
      'Equipment': ['machine', 'equipment', 'tool', 'hardware', 'device'],
      'Services': ['consulting', 'service', 'subscription', 'software', 'contractor'],
      'Education': ['training', 'conference', 'seminar', 'workshop', 'course', 'education'],
      'Insurance': ['insurance', 'coverage', 'policy', 'liability'],
      'Utilities': ['utility', 'electric', 'water', 'gas', 'internet', 'phone', 'mobile'],
      'Rent': ['rent', 'lease', 'office space', 'workspace']
    }

    let bestMatch = null
    const descLower = description.toLowerCase()

    // Try to find a match using keywords
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

    // If no keyword match, try to find a match based on amount patterns
    if (!bestMatch && amount) {
      if (amount >= 1000) {
        bestMatch = taxCodes?.find(code => code.expense_category === 'Equipment')
      } else if (amount >= 500) {
        bestMatch = taxCodes?.find(code => code.expense_category === 'Services')
      } else if (amount >= 100) {
        bestMatch = taxCodes?.find(code => code.expense_category === 'Office')
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