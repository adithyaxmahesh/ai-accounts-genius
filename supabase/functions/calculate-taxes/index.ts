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

const STANDARD_DEDUCTION = 5202 // California standard deduction for 2023

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

    // Fetch all revenue records
    const { data: revenueRecords } = await supabase
      .from('revenue_records')
      .select('amount, category')
      .eq('user_id', userId)

    const totalRevenue = revenueRecords?.reduce((sum, record) => {
      return sum + (Number(record.amount) || 0)
    }, 0) || 0

    console.log('Total revenue:', totalRevenue)

    // Get write-offs with valid tax codes
    const { data: writeOffs } = await supabase
      .from('write_offs')
      .select(`
        amount,
        description,
        status,
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
      if (writeOff.status === 'approved') {
        return sum + (Number(writeOff.amount) || 0)
      }
      return sum
    }, 0) || 0

    // Use the larger of standard deduction or itemized deductions
    const finalDeductions = Math.max(totalDeductions, STANDARD_DEDUCTION)
    console.log('Total deductions:', finalDeductions)

    // Calculate taxable income
    const taxableIncome = Math.max(0, totalRevenue - finalDeductions)
    console.log('Taxable income:', taxableIncome)

    // Calculate California progressive tax
    let estimatedTax = 0
    let remainingIncome = taxableIncome

    for (const bracket of CA_TAX_BRACKETS) {
      if (remainingIncome <= 0) break

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.max - bracket.min + 1
      )
      
      estimatedTax += taxableInBracket * bracket.rate
      remainingIncome -= taxableInBracket
    }

    // Add Mental Health Services Tax (1% for income over $1 million)
    if (taxableIncome > 1000000) {
      estimatedTax += (taxableIncome - 1000000) * 0.01
    }

    console.log('Estimated California tax:', estimatedTax)

    // Calculate effective tax rate
    const effectiveRate = taxableIncome > 0 ? (estimatedTax / taxableIncome) * 100 : 0

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
          total_deductions: finalDeductions,
          taxable_income: taxableIncome,
          effective_rate: effectiveRate,
          items: writeOffs
        }
      })

    if (analysisError) {
      console.error('Error storing tax analysis:', analysisError)
      throw analysisError
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalAmount: totalRevenue,
        deductions: finalDeductions,
        taxableIncome,
        estimatedTax,
        state: 'California',
        effectiveRate
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