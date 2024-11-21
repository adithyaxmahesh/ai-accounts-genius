import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// California tax brackets for 2023 (single filer)
const CA_TAX_BRACKETS = [
  { min: 0, max: 10099, rate: 0.01 },
  { min: 10100, max: 23942, rate: 0.02 },
  { min: 23943, max: 37788, rate: 0.04 },
  { min: 37789, max: 52455, rate: 0.06 },
  { min: 52456, max: 66295, rate: 0.08 },
  { min: 66296, max: 338639, rate: 0.093 },
  { min: 338640, max: 406364, rate: 0.103 },
  { min: 406365, max: 677275, rate: 0.113 },
  { min: 677276, max: Infinity, rate: 0.123 }
]

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

    // Calculate California progressive tax
    let estimatedTax = 0
    for (const bracket of CA_TAX_BRACKETS) {
      if (taxableIncome > bracket.min) {
        const taxableAmount = Math.min(
          taxableIncome - bracket.min,
          (bracket.max - bracket.min) || (taxableIncome - bracket.min)
        )
        estimatedTax += taxableAmount * bracket.rate
      }
    }

    // Add Mental Health Services Tax (1% for income over $1 million)
    if (taxableIncome > 1000000) {
      estimatedTax += (taxableIncome - 1000000) * 0.01
    }

    console.log('Estimated California tax:', estimatedTax)

    // Calculate potential savings (difference between max rate and actual effective rate)
    const maxRate = 0.123 // California's highest marginal rate
    const potentialSavings = totalDeductions * maxRate

    // Store analysis results
    const { error: analysisError } = await supabase
      .from('tax_analysis')
      .insert({
        user_id: userId,
        analysis_type: 'california_annual',
        tax_impact: estimatedTax,
        jurisdiction: 'California',
        recommendations: {
          total_revenue: totalRevenue,
          total_deductions: totalDeductions,
          taxable_income: taxableIncome,
          potential_savings: potentialSavings,
          write_offs: writeOffs,
          effective_rate: taxableIncome > 0 ? (estimatedTax / taxableIncome) * 100 : 0
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
        state: 'California',
        taxableIncome,
        totalRevenue,
        potentialSavings
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