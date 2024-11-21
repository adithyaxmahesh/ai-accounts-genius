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
    console.log('Calculating taxes for user:', userId)

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
    console.log('User state:', userState)

    // Get state tax rates
    const { data: taxRates } = await supabase
      .from('state_tax_rates')
      .select('*')
      .eq('state', userState)
      .eq('tax_year', new Date().getFullYear())
      .order('min_income', { ascending: true })

    console.log('Tax rates found:', taxRates?.length)

    // Fetch revenue records for total income
    const { data: revenueRecords } = await supabase
      .from('revenue_records')
      .select('amount')
      .eq('user_id', userId)

    const totalRevenue = revenueRecords?.reduce((sum, record) => {
      return sum + (record.amount || 0)
    }, 0) || 0

    console.log('Total revenue:', totalRevenue)

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
        return sum + (writeOff.amount || 0)
      }
      return sum
    }, 0) || 0

    console.log('Total deductions:', totalDeductions)

    const taxableIncome = Math.max(0, totalRevenue - totalDeductions)
    console.log('Taxable income:', taxableIncome)

    // Calculate progressive tax using tax brackets
    let estimatedTax = 0
    if (taxRates && taxRates.length > 0) {
      for (const bracket of taxRates) {
        const min = bracket.min_income
        const max = bracket.max_income || Infinity
        const rate = bracket.rate

        if (taxableIncome > min) {
          const taxableAmount = Math.min(taxableIncome - min, max - min)
          estimatedTax += taxableAmount * (rate / 100)
        }
      }
    } else {
      // Fallback tax calculation if no tax rates found (simplified)
      estimatedTax = taxableIncome * 0.15 // 15% flat rate as fallback
    }

    console.log('Estimated tax:', estimatedTax)

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

    if (analysisError) {
      console.error('Error storing tax analysis:', analysisError)
      throw analysisError
    }

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