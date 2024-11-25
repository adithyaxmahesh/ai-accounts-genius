import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auditId } = await req.json();
    
    if (!auditId) {
      throw new Error('Audit ID is required');
    }

    console.log('Starting automated audit:', { auditId });
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: audit, error: fetchError } = await supabaseClient
      .from('audit_reports')
      .select('*, audit_items(*)')
      .eq('id', auditId)
      .single();

    if (fetchError) {
      console.error('Error fetching audit data:', fetchError);
      throw new Error('Failed to fetch audit data');
    }

    if (!audit) {
      throw new Error('Audit not found');
    }

    console.log('Fetched audit data, starting analysis...');

    // Calculate risk scores
    const riskScores = {
      overallScore: 0,
      factors: {
        transactionVolume: 0,
        largeTransactions: 0,
        unusualPatterns: 0,
        controlWeaknesses: 0,
      }
    };

    // Calculate control effectiveness
    const controlEffectiveness = {
      overallEffectiveness: 0,
      tests: [
        {
          name: "Transaction Monitoring",
          result: {
            score: 0,
            findings: []
          }
        }
      ]
    };

    // Detect anomalies
    const anomaly_detection = {
      anomalies: [],
      count: 0
    };

    // Perform analysis based on audit items
    if (audit.audit_items && audit.audit_items.length > 0) {
      // Risk score calculations
      const totalTransactions = audit.audit_items.length;
      const largeTransactions = audit.audit_items.filter(item => item.amount > 10000).length;
      
      riskScores.factors.transactionVolume = Math.min(totalTransactions / 100, 1);
      riskScores.factors.largeTransactions = largeTransactions / totalTransactions;
      riskScores.factors.unusualPatterns = Math.random(); // Replace with actual pattern detection
      riskScores.factors.controlWeaknesses = Math.random(); // Replace with actual control analysis
      
      riskScores.overallScore = Object.values(riskScores.factors)
        .reduce((sum, score) => sum + score, 0) / 4;

      // Control effectiveness calculations
      controlEffectiveness.tests[0].result.score = 1 - riskScores.overallScore;
      if (largeTransactions > 0) {
        controlEffectiveness.tests[0].result.findings.push(
          `Found ${largeTransactions} large transactions that require review`
        );
      }
      
      controlEffectiveness.overallEffectiveness = controlEffectiveness.tests[0].result.score;

      // Anomaly detection
      const anomalies = audit.audit_items
        .filter(item => item.amount > 50000)
        .map(item => ({
          type: 'large_transaction',
          description: `Unusually large transaction: $${item.amount}`,
          severity: 'high'
        }));

      anomaly_detection.anomalies = anomalies;
      anomaly_detection.count = anomalies.length;
    }

    // Update audit report with findings
    const { error: updateError } = await supabaseClient
      .from('audit_reports')
      .update({
        automated_analysis: true,
        risk_scores: riskScores,
        control_effectiveness: controlEffectiveness,
        anomaly_detection: anomaly_detection,
        status: 'completed'
      })
      .eq('id', auditId);

    if (updateError) {
      console.error('Error updating audit report:', updateError);
      throw new Error('Failed to update audit report');
    }

    console.log('Automated audit completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        riskScores,
        controlEffectiveness,
        anomaly_detection
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in automated audit:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    );
  }
});