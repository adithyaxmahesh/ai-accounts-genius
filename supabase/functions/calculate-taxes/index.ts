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
    const totalRevenue = auditItems?.reduce((sum, item) => {
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

    const taxableIncome = Math.max(0, totalRevenue - totalDeductions)

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

    // Store analysis results
    const { error: analysisError } = await supabase
      .from('tax_analysis')
      .insert({
        user_id: userId,
        analysis_type: 'annual',
        tax_impact: estimatedTax,
        jurisdiction: userState,
        recommendations: {
          total_revenue: totalRevenue,
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
        totalRevenue
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