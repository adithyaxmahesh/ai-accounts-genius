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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) throw profilesError;

    // Update metrics for each user
    for (const profile of profiles) {
      // Get financial data
      const [
        { data: assets },
        { data: liabilities },
        { data: revenue },
        { data: expenses }
      ] = await Promise.all([
        supabase
          .from('balance_sheet_items')
          .select('amount')
          .eq('user_id', profile.id)
          .eq('category', 'asset'),
        supabase
          .from('balance_sheet_items')
          .select('amount')
          .eq('user_id', profile.id)
          .eq('category', 'liability'),
        supabase
          .from('revenue_records')
          .select('amount')
          .eq('user_id', profile.id),
        supabase
          .from('write_offs')
          .select('amount')
          .eq('user_id', profile.id)
      ]);

      // Calculate metrics
      const totalAssets = assets?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
      const totalLiabilities = liabilities?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
      const totalRevenue = revenue?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

      const currentRatio = totalLiabilities ? totalAssets / totalLiabilities : 0;
      const debtRatio = totalAssets ? totalLiabilities / totalAssets : 0;
      const cashFlowScore = totalRevenue ? (totalRevenue - totalExpenses) / totalRevenue : 0;

      // Update or insert metrics
      const { error: upsertError } = await supabase
        .from('financial_health_metrics')
        .upsert({
          user_id: profile.id,
          current_ratio: currentRatio,
          debt_ratio: debtRatio,
          cash_flow_score: cashFlowScore,
          metrics_data: {
            total_assets: totalAssets,
            total_liabilities: totalLiabilities,
            total_revenue: totalRevenue,
            total_expenses: totalExpenses
          }
        });

      if (upsertError) throw upsertError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in update-financial-health function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});