import { supabase } from "@/integrations/supabase/client";

export const getStatusExplanation = (status: string) => {
  switch (status) {
    case 'planning':
      return "Initial phase: Assessing business context and defining audit scope";
    case 'control_evaluation':
      return "Evaluating internal controls and risk assessment";
    case 'evidence_gathering':
      return "Collecting and analyzing financial data and documentation";
    case 'review':
      return "Evaluating findings and preparing draft conclusions";
    case 'completed':
      return "Audit completed with final opinion issued";
    default:
      return "Status pending or unknown";
  }
};

export const getRiskLevelExplanation = (level: string) => {
  switch (level) {
    case 'high':
      return "Significant issues identified requiring immediate attention";
    case 'medium':
      return "Notable concerns that should be addressed";
    case 'low':
      return "Minor or no issues identified";
    default:
      return "Risk level not assessed";
  }
};

export const startNewAudit = async (title: string) => {
  const { data, error } = await supabase
    .from('audit_reports')
    .insert([
      {
        title,
        status: 'planning',
        risk_level: 'medium',
        description: "Initial audit scope and planning phase",
        findings: [],
        recommendations: []
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAuditStatus = async (id: string, status: string, findings: any[] = []) => {
  const { data, error } = await supabase
    .from('audit_reports')
    .update({
      status,
      findings: findings.length ? findings : undefined
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addAuditItem = async (auditId: string, item: any) => {
  const { data, error } = await supabase
    .from('audit_items')
    .insert([{
      audit_id: auditId,
      ...item
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};