import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { performRiskAssessment } from './riskAssessment.ts';
import { testInternalControls } from './controlTests.ts';
import { detectAnomalies } from './anomalyDetection.ts';
import { AuditData } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auditId } = await req.json();
    
    if (!auditId) {
      throw new Error('Audit ID is required');
    }

    console.log('Starting automated audit for audit ID:', auditId);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch audit data and related transactions
    const { data: audit, error: fetchError } = await supabaseClient
      .from('audit_reports')
      .select(`
        *,
        audit_items (*)
      `)
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

    // 1. Risk Assessment
    const riskScores = await performRiskAssessment(audit as AuditData);
    console.log('Risk assessment completed:', riskScores);
    
    // 2. Control Testing
    const controlEffectiveness = await testInternalControls(audit as AuditData, supabaseClient);
    console.log('Control testing completed:', controlEffectiveness);
    
    // 3. Anomaly Detection
    const anomalies = detectAnomalies(audit as AuditData);
    console.log('Anomaly detection completed:', anomalies);

    // Update audit report with findings
    const { error: updateError } = await supabaseClient
      .from('audit_reports')
      .update({
        automated_analysis: {
          completed_at: new Date().toISOString(),
          risk_scores: riskScores,
          control_effectiveness: controlEffectiveness,
          anomaly_detection: anomalies
        },
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
        anomalies
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