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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()
    console.log('Calculating taxes for user:', user_id)

    // Get all write-offs for the user
    const { data: writeOffs, error: writeOffsError } = await supabase
      .from('write_offs')
      .select(`
        amount,
        tax_codes (
          code,
          description,
          deduction_type
        )
      `)
      .eq('user_id', user_id)

    if (writeOffsError) throw writeOffsError

    // Calculate total deductions
    const totalDeductions = writeOffs?.reduce((sum, writeOff) => sum + (writeOff.amount || 0), 0) || 0

    // Get revenue records
    const { data: revenue, error: revenueError } = await supabase
      .from('revenue_records')
      .select('amount')
      .eq('user_id', user_id)

    if (revenueError) throw revenueError

    // Calculate total income
    const totalIncome = revenue?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0

    // Simple tax calculation (this is a basic example - you'd want more sophisticated calculations in production)
    const estimatedTax = Math.max(0, (totalIncome - totalDeductions) * 0.3) // 30% tax rate example

    // Generate recommendations
    const recommendations = []
    
    if (totalDeductions < totalIncome * 0.2) {
      recommendations.push({
        type: 'deduction',
        message: 'Your deductions are lower than average. Consider tracking more business expenses.',
        potentialSavings: totalIncome * 0.05
      })
    }

    if (writeOffs?.length === 0) {
      recommendations.push({
        type: 'writeoffs',
        message: 'You haven\'t recorded any write-offs. Start tracking your business expenses to reduce your tax liability.',
        potentialSavings: totalIncome * 0.1
      })
    }

    // Calculate potential savings
    const potentialSavings = recommendations.reduce((sum, rec) => sum + (rec.potentialSavings || 0), 0)

    // Store the calculation
    const { error: insertError } = await supabase
      .from('automatic_tax_calculations')
      .upsert({
        user_id,
        total_income: totalIncome,
        total_deductions: totalDeductions,
        estimated_tax: estimatedTax,
        potential_savings: potentialSavings,
        recommendations
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({
        success: true,
        estimatedTax,
        totalDeductions,
        totalIncome,
        potentialSavings,
        recommendations
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in calculate-automatic-taxes:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})