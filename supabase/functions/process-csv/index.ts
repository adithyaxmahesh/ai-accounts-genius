import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const text = await file.text()
    const records = parse(text, { skipFirstRow: true })

    let totalIncome = 0
    let totalExpenses = 0
    const financialData = records.map((record: string[]) => {
      const [date, description, amount, type] = record
      const numAmount = parseFloat(amount)

      if (type.toLowerCase() === 'income') {
        totalIncome += numAmount
      } else {
        totalExpenses += numAmount
      }

      return {
        date: new Date(date),
        description,
        amount: numAmount,
        type: type.toLowerCase()
      }
    })

    const taxableIncome = totalIncome - totalExpenses
    // Simple tax calculation - 20% of taxable income
    const taxesOwed = taxableIncome * 0.2

    const result = {
      financialData,
      taxesOwed: {
        totalIncome,
        totalExpenses,
        taxableIncome,
        taxesOwed
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error processing CSV:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process CSV file' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})