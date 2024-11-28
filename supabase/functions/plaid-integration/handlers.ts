import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './cors.ts'

export const handleLinkToken = async (userId: string, plaidClient: any) => {
  console.log('Creating link token for user:', userId);
  
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
    return { link_token: response.data.link_token };
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
};

export const handlePublicToken = async (
  userId: string, 
  publicToken: string, 
  plaidClient: any,
  supabase: any
) => {
  console.log('Exchanging public token for user:', userId);
  
  try {
    // Exchange public token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get institution details
    const item = await plaidClient.itemGet({ access_token: accessToken });
    const institution = await plaidClient.institutionsGetById({
      institution_id: item.data.item.institution_id,
      country_codes: ['US'],
    });

    // Get account balances
    const balances = await plaidClient.accountsGet({ access_token: accessToken });

    console.log('Got institution and balances, storing in Supabase');

    // Store Plaid connection
    const { error: connectionError } = await supabase
      .from('plaid_connections')
      .insert({
        user_id: userId,
        access_token: accessToken,
        item_id: itemId,
        institution_name: institution.data.institution.name,
      });

    if (connectionError) throw connectionError;

    // Update balance sheet items
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

      if (balanceError) throw balanceError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in exchange-public-token:', error);
    throw error;
  }
};

export const handleSyncBalances = async (
  userId: string,
  plaidClient: any,
  supabase: any
) => {
  console.log('Syncing balances for user:', userId);
  
  try {
    const { data: connections, error: connectionsError } = await supabase
      .from('plaid_connections')
      .select('*')
      .eq('user_id', userId);

    if (connectionsError) throw connectionsError;

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

    return { success: true };
  } catch (error) {
    console.error('Error syncing balances:', error);
    throw error;
  }
};