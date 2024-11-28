import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY2') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, action } = await req.json()
    console.log('Received request:', { userId, action })

    if (!userId) {
      throw new Error('User ID is required')
    }

    switch (action) {
      case 'get-cash-balance': {
        console.log('Fetching cash balance for user:', userId)
        try {
          const balance = await stripe.balance.retrieve();
          return new Response(
            JSON.stringify(balance),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          );
        } catch (error) {
          console.error('Error retrieving balance:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to retrieve balance' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }
      }

      case 'create-connect-account': {
        console.log('Creating Stripe Connect account for user:', userId)
        try {
          // Create a Stripe Connect account
          const account = await stripe.accounts.create({
            type: 'standard',
            metadata: {
              supabaseUserId: userId,
            },
          })
          console.log('Created Stripe account:', account.id)

          // Create account link with proper return URLs
          const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${req.headers.get('origin')}/revenue`,
            return_url: `${req.headers.get('origin')}/revenue`,
            type: 'account_onboarding',
          })
          console.log('Created account link:', accountLink.url)

          return new Response(
            JSON.stringify({ url: accountLink.url }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        } catch (error) {
          console.error('Error creating Stripe account:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to create Stripe account' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
    }

  } catch (error) {
    console.error('Error in stripe-integration:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})