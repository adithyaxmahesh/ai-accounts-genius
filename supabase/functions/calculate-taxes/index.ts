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

    // Get user's state from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('state')
      .eq('id', userId)
      .single()

    const userState = profile?.state || 'California'

    // Get state tax rates
    const { data: taxRates } = await supabase
      .from('state_tax_rates')
      .select('*')
      .eq('state', userState)
      .eq('tax_year', new Date().getFullYear())
      .order('min_income', { ascending: true })

    // Fetch audit items and their status
    const { data: auditItems } = await supabase
      .from('audit_items')
      .select('*')
      .eq('user_id', userId)

    // Calculate total revenue from audit items
    const totalIncome = auditItems?.reduce((sum, item) => {
      return sum + (item.amount || 0)
    }, 0) || 0

    // Get write-offs with valid tax codes
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
      .eq('status', 'approved')

    // Calculate total deductions from approved write-offs
    const totalDeductions = writeOffs?.reduce((sum, writeOff) => {
      if (writeOff.tax_codes && writeOff.status === 'approved') {
        return sum + writeOff.amount
      }
      return sum
    }, 0) || 0

    const taxableIncome = Math.max(0, totalIncome - totalDeductions)

    // Calculate progressive tax using tax brackets
    let estimatedTax = 0
    if (taxRates) {
      for (const bracket of taxRates) {
        const min = bracket.min_income
        const max = bracket.max_income || Infinity
        const rate = bracket.rate

        if (taxableIncome > min) {
          const taxableAmount = Math.min(taxableIncome - min, max - min)
          estimatedTax += taxableAmount * (rate / 100)
        }
      }
    }

    // Calculate potential savings (20% of current tax as an example)
    const potentialSavings = estimatedTax * 0.2

    // Store calculation results
    const { error: calculationError } = await supabase
      .from('automatic_tax_calculations')
      .insert({
        user_id: userId,
        total_income: totalIncome,
        total_deductions: totalDeductions,
        estimated_tax: estimatedTax,
        potential_savings: potentialSavings,
        recommendations: {
          missing_docs: writeOffs?.filter(w => !w.tax_codes).map(w => w.description) || [],
          total_income: totalIncome,
          total_deductions: totalDeductions,
          taxable_income: taxableIncome,
          write_offs: writeOffs,
          state_tax_rates: taxRates
        }
      })

    if (calculationError) throw calculationError

    // Also store in tax_analysis for compatibility
    const { error: analysisError } = await supabase
      .from('tax_analysis')
      .insert({
        user_id: userId,
        analysis_type: 'annual',
        tax_impact: estimatedTax,
        jurisdiction: userState,
        recommendations: {
          total_revenue: totalIncome,
          total_deductions: totalDeductions,
          taxable_income: taxableIncome,
          write_offs: writeOffs,
          state_tax_rates: taxRates
        }
      })

    if (analysisError) throw analysisError

    return new Response(
      JSON.stringify({ 
        success: true,
        taxDue: estimatedTax,
        deductions: totalDeductions,
        state: userState,
        taxableIncome,
        totalIncome
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