import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { formId } = await req.json()
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get form data
    const { data: formData, error: formError } = await supabaseClient
      .from('generated_tax_forms')
      .select(`
        *,
        tax_form_templates (*)
      `)
      .eq('id', formId)
      .single()

    if (formError) throw formError

    return new Response(
      JSON.stringify({ 
        success: true,
        data: formData
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  } catch (error) {
    console.error('Error in generate-tax-form function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    )
  }
})