import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  try {
    const { userId, action } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'create-connect-account') {
      const account = await stripe.accounts.create({
        type: 'standard',
        metadata: {
          supabaseUserId: userId,
        },
      })

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.headers.get('origin')}/revenue`,
        return_url: `${req.headers.get('origin')}/revenue`,
        type: 'account_onboarding',
      })

      return new Response(
        JSON.stringify({ url: accountLink.url }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})