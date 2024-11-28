import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'
import { createPlaidClient } from './plaidClient.ts'
import { 
  handleLinkToken, 
  handlePublicToken, 
  handleSyncBalances 
} from './handlers.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, userId, publicToken } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plaidClient = createPlaidClient();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing ${action} for user ${userId}`);

    let result;
    switch (action) {
      case 'create-link-token':
        result = await handleLinkToken(userId, plaidClient);
        break;
      
      case 'exchange-public-token':
        if (!publicToken) {
          return new Response(
            JSON.stringify({ error: 'Public token is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        result = await handlePublicToken(userId, publicToken, plaidClient, supabase);
        break;
      
      case 'sync-balances':
        result = await handleSyncBalances(userId, plaidClient, supabase);
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'For sandbox testing, use credentials like "user_good" with any password or "user_bank_income" with {} as password'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})