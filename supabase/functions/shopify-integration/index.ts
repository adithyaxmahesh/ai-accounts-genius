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
    const { shop, accessToken, userId } = await req.json()
    console.log('Connecting Shopify store:', { shop, userId })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store Shopify connection
    const { error: connectionError } = await supabase
      .from('shopify_connections')
      .insert({
        user_id: userId,
        shop_url: shop,
        access_token: accessToken,
        webhook_secret: crypto.randomUUID()
      })

    if (connectionError) throw connectionError

    // Fetch initial orders
    const ordersResponse = await fetch(`https://${shop}/admin/api/2024-01/orders.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    })

    const { orders } = await ordersResponse.json()

    // Process orders into revenue records
    const revenueRecords = orders.map((order: any) => ({
      user_id: userId,
      amount: parseFloat(order.total_price),
      category: 'shopify_sales',
      description: `Shopify Order #${order.order_number}`,
      date: order.created_at.split('T')[0]
    }))

    // Insert revenue records
    const { error: revenueError } = await supabase
      .from('revenue_records')
      .insert(revenueRecords)

    if (revenueError) throw revenueError

    // Log successful sync
    await supabase
      .from('shopify_sync_logs')
      .insert({
        connection_id: (await supabase
          .from('shopify_connections')
          .select('id')
          .eq('shop_url', shop)
          .single()
        ).data?.id,
        sync_type: 'initial_sync',
        status: 'completed',
        details: { orders_processed: orders.length }
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Shopify store connected and initial sync completed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in shopify-integration:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})