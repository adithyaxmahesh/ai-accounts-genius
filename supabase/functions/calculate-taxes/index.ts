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

    const userState = profile?.state || 'California' // Default to California if not set

    // Get state tax rates
    const { data: taxRates } = await supabase
      .from('state_tax_rates')
      .select('*')
      .eq('state', userState)
      .eq('tax_year', 2024)
      .order('min_income', { ascending: true })

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

    // Calculate tax using progressive tax brackets
    let estimatedTax = 0
    if (taxRates) {
      for (const bracket of taxRates) {
        const min = bracket.min_income
        const max = bracket.max_income || Infinity
        const rate = bracket.rate

        if (taxableIncome > min) {
          const taxableAmount = Math.min(taxableIncome - min, (max - min) || Infinity)
          estimatedTax += taxableAmount * (rate / 100) // Convert percentage to decimal
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
          items: deductions,
          total_deductions: totalDeductions,
          missing_docs: deductions.filter(d => d.status === 'pending'),
          state_tax_rates: taxRates,
          taxable_income: taxableIncome
        }
      })

    if (analysisError) throw analysisError

    return new Response(
      JSON.stringify({ 
        success: true,
        taxDue: estimatedTax,
        deductions: totalDeductions,
        state: userState,
        taxableIncome
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