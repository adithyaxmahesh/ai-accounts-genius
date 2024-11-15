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
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // First, get recent transactions for initial risk assessment
  const { data: transactions } = await supabase
    .from('revenue_records')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(100);

  // Perform initial risk assessment
  const totalAmount = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const avgAmount = totalAmount / (transactions?.length || 1);
  const hasLargeTransactions = transactions?.some(t => t.amount > avgAmount * 2);
  
  const initialRiskLevel = hasLargeTransactions ? 'high' : 'medium';

  const { data, error } = await supabase
    .from('audit_reports')
    .insert([
      {
        title,
        status: 'planning',
        risk_level: initialRiskLevel,
        description: "Initial audit scope and planning phase",
        findings: [],
        recommendations: [
          "Review all transactions above average threshold",
          "Verify supporting documentation for large transactions",
          "Assess internal controls effectiveness"
        ],
        user_id: user.id
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating audit:', error);
    throw new Error(`Failed to create audit: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned after creating audit");
  }

  // Add initial audit items based on risk assessment
  if (transactions) {
    const auditItems = transactions
      .filter(t => t.amount > avgAmount * 1.5)
      .map(t => ({
        audit_id: data.id,
        category: t.category,
        description: `Large transaction: ${t.description || 'No description'}`,
        amount: t.amount,
        status: t.amount > avgAmount * 2 ? 'flagged' : 'pending'
      }));

    if (auditItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('audit_items')
        .insert(auditItems);

      if (itemsError) {
        console.error('Error creating audit items:', itemsError);
      }
    }
  }

  return data;
};

export const updateAuditStatus = async (id: string, status: string) => {
  // Get current audit state
  const { data: audit } = await supabase
    .from('audit_reports')
    .select('*, audit_items(*)')
    .eq('id', id)
    .single();

  if (!audit) throw new Error("Audit not found");

  // Update recommendations based on findings
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

  // Update audit status and findings
  const { data, error } = await supabase
    .from('audit_reports')
    .update({
      status,
      findings: findings.length ? findings : undefined,
      recommendations: recommendations.length ? recommendations : undefined,
      risk_level: findings.length > 2 ? 'high' : findings.length > 0 ? 'medium' : 'low'
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};