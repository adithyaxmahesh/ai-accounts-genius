import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
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

    // In a real implementation, this would generate a PDF
    // For now, we just return the JSON data
    return new Response(
      JSON.stringify({ 
        success: true,
        data: formData
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 400
      }
    )
  }
})