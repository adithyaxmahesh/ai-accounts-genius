import { Configuration, PlaidApi, PlaidEnvironments } from 'https://esm.sh/plaid@12.5.0'

export const createPlaidClient = () => {
  const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
        'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
      },
    },
  });

  return new PlaidApi(configuration);
};