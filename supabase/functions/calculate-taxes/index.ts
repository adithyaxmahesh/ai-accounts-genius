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
    const { userId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch revenue records
    const { data: revenue } = await supabase
      .from('revenue_records')
      .select('*')
      .eq('user_id', userId)

    // Fetch write-offs and their associated tax codes
    const { data: writeOffs } = await supabase
      .from('write_offs')
      .select(`
        *,
        tax_codes (
          code,
          description,
          category,
          deduction_type
        )
      `)
      .eq('user_id', userId)

    // Fetch applicable tax rules
    const { data: taxRules } = await supabase
      .from('tax_rules')
      .select(`
        *,
        irs_publications (
          publication_number,
          title
        )
      `)
      .lte('effective_date', new Date().toISOString())
      .gt('expiration_date', new Date().toISOString())

    // Calculate total revenue
    const totalRevenue = revenue?.reduce((sum, record) => sum + record.amount, 0) || 0

    // Process deductions
    const deductions = writeOffs?.reduce((acc, writeOff) => {
      if (writeOff.tax_codes) {
        acc.push({
          amount: writeOff.amount,
          description: writeOff.description,
          status: 'approved',
          rule: `${writeOff.tax_codes.code} - ${writeOff.tax_codes.description}`
        })
      } else {
        acc.push({
          amount: writeOff.amount,
          description: writeOff.description,
          status: 'pending',
          rule: 'Needs classification'
        })
      }
      return acc
    }, [] as any[]) || []

    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
    const taxableIncome = totalRevenue - totalDeductions
    const estimatedTax = taxableIncome * 0.25 // Simplified tax rate for example

    // Store analysis results
    const { error: analysisError } = await supabase
      .from('tax_analysis')
      .insert({
        user_id: userId,
        analysis_type: 'annual',
        tax_impact: estimatedTax,
        recommendations: {
          items: deductions,
          total_deductions: totalDeductions,
          missing_docs: deductions.filter(d => d.status === 'pending'),
          applicable_rules: taxRules?.map(rule => ({
            code: rule.rule_code,
            description: rule.description,
            publication: rule.irs_publications?.publication_number
          }))
        }
      })

    if (analysisError) throw analysisError

    return new Response(
      JSON.stringify({ 
        success: true,
        taxDue: estimatedTax,
        deductions: totalDeductions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in calculate-taxes function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})