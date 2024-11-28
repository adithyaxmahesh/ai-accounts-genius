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
      case 'create-connect-account': {
        console.log('Creating Stripe Connect account for user:', userId)
        try {
          // Create a Stripe Connect account with additional capabilities
          const account = await stripe.accounts.create({
            type: 'standard',
            metadata: {
              supabaseUserId: userId,
            },
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
              bank_transfer_payments: { requested: true }
            },
          })
          console.log('Created Stripe account:', account.id)

          // Create account link for onboarding
          const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${req.headers.get('origin')}/revenue?error=true`,
            return_url: `${req.headers.get('origin')}/revenue?success=true`,
            type: 'account_onboarding',
            collect: 'eventually_due',
          })
          console.log('Created account link:', accountLink.url)

          return new Response(
            JSON.stringify({ url: accountLink.url, accountId: account.id }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        } catch (error) {
          console.error('Error creating Stripe account:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }
      }

      case 'get-account-status': {
        const { accountId } = await req.json()
        if (!accountId) {
          throw new Error('Account ID is required')
        }

        try {
          const account = await stripe.accounts.retrieve(accountId)
          return new Response(
            JSON.stringify({ account }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        } catch (error) {
          console.error('Error retrieving Stripe account:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
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