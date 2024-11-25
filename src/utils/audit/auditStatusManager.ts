import { supabase } from "@/integrations/supabase/client";
import { generateAuditReport } from "./auditReportGenerator";

export const updateAuditStatus = async (id: string, status: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  const { data: audit } = await supabase
    .from('audit_reports')
    .select('*, audit_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!audit) throw new Error("Audit not found");

  const recommendations = [];
  const findings = [];

  if (audit.audit_items) {
    const flaggedItems = audit.audit_items.filter(item => item.status === 'flagged');
    if (flaggedItems.length > 0) {
      findings.push(`Found ${flaggedItems.length} suspicious transactions`);
      recommendations.push("Review all flagged transactions in detail");
      recommendations.push("Consider implementing additional controls for large transactions");
    }

    const totalAmount = audit.audit_items.reduce((sum, item) => sum + (item.amount || 0), 0);
    if (totalAmount > 100000) {
      findings.push(`High total transaction volume: $${totalAmount.toLocaleString()}`);
      recommendations.push("Consider quarterly review cycles");
    }
  }

  const { data, error } = await supabase
    .from('audit_reports')
    .update({
      status,
      findings: findings.length ? findings : undefined,
      recommendations: recommendations.length ? recommendations : undefined,
      risk_level: findings.length > 2 ? 'high' : findings.length > 0 ? 'medium' : 'low',
      risk_scores: {
        critical: findings.length > 2 ? 1 : 0,
        major: findings.length > 0 ? 1 : 0,
        moderate: findings.length
      }
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  if (status === 'completed') {
    try {
      await generateAuditReport(data);
    } catch (error) {
      console.error('Error generating audit report:', error);
    }
  }

  return data;
};