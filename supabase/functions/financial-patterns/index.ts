import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, timeframe = '6months' } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch historical financial data
    const [revenueData, expenseData, cashFlowData] = await Promise.all([
      supabaseClient
        .from('revenue_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true }),
      supabaseClient
        .from('write_offs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true }),
      supabaseClient
        .from('cash_flow_statements')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
    ])

    // Analyze patterns using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst AI. Analyze patterns and make predictions based on historical financial data.'
          },
          {
            role: 'user',
            content: `Analyze these financial patterns and provide insights: ${JSON.stringify({
              revenue: revenueData.data,
              expenses: expenseData.data,
              cashFlow: cashFlowData.data
            })}`
          }
        ],
      }),
    })

    const aiResponse = await openAIResponse.json()
    const analysis = aiResponse.choices[0].message.content

    // Calculate statistical patterns
    const patterns = {
      seasonality: calculateSeasonality(revenueData.data || []),
      trends: calculateTrends(revenueData.data || [], expenseData.data || []),
      predictions: generatePredictions(revenueData.data || [], expenseData.data || []),
      anomalies: detectAnomalies(revenueData.data || [], expenseData.data || []),
      correlations: findCorrelations(revenueData.data || [], cashFlowData.data || [])
    }

    return new Response(
      JSON.stringify({ 
        patterns,
        aiAnalysis: analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in financial-patterns function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Statistical analysis functions
function calculateSeasonality(data: any[]) {
  // Detect seasonal patterns using time series decomposition
  const monthlyTotals = data.reduce((acc, record) => {
    const month = new Date(record.date).getMonth()
    acc[month] = (acc[month] || 0) + record.amount
    return acc
  }, {})
  
  return Object.entries(monthlyTotals)
    .map(([month, total]) => ({
      month: parseInt(month),
      total,
      strength: calculateSeasonalStrength(total, Object.values(monthlyTotals))
    }))
}

function calculateTrends(revenueData: any[], expenseData: any[]) {
  // Calculate moving averages and trend directions
  const periods = 3 // quarters
  const movingAvgRevenue = calculateMovingAverage(revenueData.map(r => r.amount), periods)
  const movingAvgExpenses = calculateMovingAverage(expenseData.map(r => r.amount), periods)
  
  return {
    revenue: {
      trend: movingAvgRevenue[movingAvgRevenue.length - 1] > movingAvgRevenue[0] ? 'up' : 'down',
      strength: calculateTrendStrength(movingAvgRevenue)
    },
    expenses: {
      trend: movingAvgExpenses[movingAvgExpenses.length - 1] > movingAvgExpenses[0] ? 'up' : 'down',
      strength: calculateTrendStrength(movingAvgExpenses)
    }
  }
}

function generatePredictions(revenueData: any[], expenseData: any[]) {
  // Generate next 3 months predictions using simple linear regression
  const revenuePredictions = linearRegression(revenueData.map((r, i) => [i, r.amount]))
  const expensePredictions = linearRegression(expenseData.map((r, i) => [i, r.amount]))
  
  return {
    nextQuarter: {
      revenue: revenuePredictions.map((p: number) => Math.max(0, p)),
      expenses: expensePredictions.map((p: number) => Math.max(0, p))
    }
  }
}

function detectAnomalies(revenueData: any[], expenseData: any[]) {
  // Detect unusual patterns using statistical methods
  const revenueAnomalies = findOutliers(revenueData.map(r => r.amount))
  const expenseAnomalies = findOutliers(expenseData.map(r => r.amount))
  
  return {
    revenue: revenueAnomalies,
    expenses: expenseAnomalies
  }
}

function findCorrelations(revenueData: any[], cashFlowData: any[]) {
  // Find correlations between different financial metrics
  return {
    revenueToCashFlow: calculateCorrelation(
      revenueData.map(r => r.amount),
      cashFlowData.map(c => c.amount)
    )
  }
}

// Helper statistical functions
function calculateMovingAverage(data: number[], periods: number) {
  return data.map((_, index) => 
    index < periods - 1 
      ? null 
      : data.slice(index - periods + 1, index + 1)
          .reduce((sum, val) => sum + val, 0) / periods
  ).filter(val => val !== null) as number[]
}

function calculateSeasonalStrength(value: number, allValues: number[]) {
  const mean = allValues.reduce((sum, val) => sum + Number(val), 0) / allValues.length
  return (Number(value) - mean) / mean
}

function calculateTrendStrength(values: number[]) {
  const first = values[0]
  const last = values[values.length - 1]
  return (last - first) / first
}

function linearRegression(data: [number, number][]) {
  const n = data.length
  const xSum = data.reduce((sum, [x]) => sum + x, 0)
  const ySum = data.reduce((sum, [_, y]) => sum + y, 0)
  const xySum = data.reduce((sum, [x, y]) => sum + x * y, 0)
  const xxSum = data.reduce((sum, [x]) => sum + x * x, 0)
  
  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum)
  const intercept = (ySum - slope * xSum) / n
  
  return [1, 2, 3].map(x => slope * (n + x) + intercept)
}

function findOutliers(data: number[]) {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const stdDev = Math.sqrt(
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  )
  
  return data.map((value, index) => ({
    value,
    isOutlier: Math.abs(value - mean) > 2 * stdDev,
    index
  })).filter(item => item.isOutlier)
}

function calculateCorrelation(x: number[], y: number[]) {
  const n = Math.min(x.length, y.length)
  const xMean = x.reduce((sum, val) => sum + val, 0) / n
  const yMean = y.reduce((sum, val) => sum + val, 0) / n
  
  const numerator = x.slice(0, n).reduce((sum, val, i) => 
    sum + (val - xMean) * (y[i] - yMean), 0
  )
  
  const denominator = Math.sqrt(
    x.slice(0, n).reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0) *
    y.slice(0, n).reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0)
  )
  
  return numerator / denominator
}