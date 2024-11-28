import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, PlaidApi, PlaidEnvironments } from 'https://esm.sh/plaid@12.5.0'

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
    const { action, userId } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Plaid client with sandbox environment
    const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
          'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
        },
      },
    });

    const plaidClient = new PlaidApi(configuration);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing ${action} for user ${userId}`);

    if (action === 'create-link-token') {
      try {
        const response = await plaidClient.linkTokenCreate({
          user: { client_user_id: userId },
          client_name: 'Your App Name',
          products: ['auth', 'transactions'],
          country_codes: ['US'],
          language: 'en',
          sandbox: true
        });

        console.log('Link token created successfully');
        return new Response(
          JSON.stringify({ link_token: response.data.link_token }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error creating link token:', error);
        throw error;
      }
    }

    if (action === 'exchange-public-token') {
      const { publicToken } = await req.json()
      
      if (!publicToken) {
        return new Response(
          JSON.stringify({ error: 'Public token is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      try {
        console.log('Exchanging public token');
        const response = await plaidClient.itemPublicTokenExchange({
          public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Get institution
        const item = await plaidClient.itemGet({ access_token: accessToken });
        const institution = await plaidClient.institutionsGetById({
          institution_id: item.data.item.institution_id,
          country_codes: ['US'],
        });

        // Get account balances
        const balances = await plaidClient.accountsGet({ access_token: accessToken });
        
        console.log('Got institution and balances, storing in Supabase');

        // Store in Supabase
        const { error: connectionError } = await supabase
          .from('plaid_connections')
          .insert({
            user_id: userId,
            access_token: accessToken,
            item_id: itemId,
            institution_name: institution.data.institution.name,
          })

        if (connectionError) {
          console.error('Error storing Plaid connection:', connectionError);
          throw connectionError;
        }

        // Update or insert balance sheet items for each account
        for (const account of balances.data.accounts) {
          const { error: balanceError } = await supabase
            .from('balance_sheet_items')
            .upsert({
              user_id: userId,
              name: `${institution.data.institution.name} - ${account.name}`,
              amount: account.balances.current,
              category: 'asset',
              subcategory: 'cash',
              description: `Connected bank account (${account.type})`,
            }, {
              onConflict: 'user_id,name',
            });

          if (balanceError) {
            console.error('Error storing balance:', balanceError);
            throw balanceError;
          }
        }

        console.log('Successfully stored Plaid data');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error in exchange-public-token:', error);
        throw error;
      }
    }

    if (action === 'sync-balances') {
      try {
        console.log('Syncing balances');
        // Get all Plaid connections for the user
        const { data: connections, error: connectionsError } = await supabase
          .from('plaid_connections')
          .select('*')
          .eq('user_id', userId);

        if (connectionsError) throw connectionsError;

        // Update balances for each connection
        for (const connection of connections) {
          const balances = await plaidClient.accountsGet({ 
            access_token: connection.access_token 
          });

          for (const account of balances.data.accounts) {
            const { error: balanceError } = await supabase
              .from('balance_sheet_items')
              .upsert({
                user_id: userId,
                name: `${connection.institution_name} - ${account.name}`,
                amount: account.balances.current,
                category: 'asset',
                subcategory: 'cash',
                description: `Connected bank account (${account.type})`,
              }, {
                onConflict: 'user_id,name',
              });

            if (balanceError) throw balanceError;
          }
        }

        console.log('Successfully synced balances');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('Error syncing balances:', error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})