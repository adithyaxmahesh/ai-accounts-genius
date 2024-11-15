import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
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
    const { userId, transactions } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get historical transaction patterns
    const { data: historicalTransactions } = await supabaseClient
      .from('revenue_records')
      .select('amount, date, category')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    // Analyze for suspicious patterns
    const fraudIndicators = []
    let riskScore = 0

    // 1. Check for unusual transaction amounts
    const avgAmount = historicalTransactions?.reduce((sum, t) => sum + t.amount, 0) / historicalTransactions?.length || 0
    const stdDev = Math.sqrt(
      historicalTransactions?.reduce((sum, t) => sum + Math.pow(t.amount - avgAmount, 2), 0) / historicalTransactions?.length
    ) || 0

    transactions.forEach(transaction => {
      // Amount anomaly detection
      if (Math.abs(transaction.amount - avgAmount) > stdDev * 2) {
        fraudIndicators.push(`Unusual transaction amount: $${transaction.amount}`)
        riskScore += 0.2
      }

      // Time-based analysis
      const transactionHour = new Date(transaction.date).getHours()
      if (transactionHour < 6 || transactionHour > 22) {
        fraudIndicators.push(`Unusual transaction time: ${transactionHour}:00`)
        riskScore += 0.15
      }

      // Category deviation
      const similarCategoryTxns = historicalTransactions?.filter(t => t.category === transaction.category)
      const categoryAvg = similarCategoryTxns?.reduce((sum, t) => sum + t.amount, 0) / similarCategoryTxns?.length || 0
      if (Math.abs(transaction.amount - categoryAvg) > stdDev * 2) {
        fraudIndicators.push(`Unusual amount for category ${transaction.category}`)
        riskScore += 0.15
      }
    })

    // Velocity checks
    const last24Hours = historicalTransactions?.filter(t => 
      new Date(t.date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
    if (last24Hours?.length > 10) {
      fraudIndicators.push('High transaction frequency in last 24 hours')
      riskScore += 0.2
    }

    // Cap risk score at 1
    riskScore = Math.min(riskScore, 1)

    // Store fraud alert if risk is high
    if (riskScore > 0.5) {
      const { error } = await supabaseClient
        .from('fraud_alerts')
        .insert({
          user_id: userId,
          alert_type: 'suspicious_transaction',
          risk_score: riskScore,
          details: {
            analysis: `Potential fraud detected:\n${fraudIndicators.join('\n')}`,
            transactions
          },
          status: 'pending'
        })

      if (error) throw error
    }

    console.log('Fraud detection completed:', { riskScore, fraudIndicators })

    return new Response(
      JSON.stringify({ 
        success: true, 
        riskScore, 
        analysis: fraudIndicators.join('\n'),
        indicators: fraudIndicators 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in fraud detection:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})